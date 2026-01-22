package main

import (
	"fmt"
	"image/color"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/fogleman/gg"
	"gopkg.in/yaml.v3"
)

type FrontMatter struct {
	Title       string `yaml:"title"`
	Description string `yaml:"description"`
	Image       string `yaml:"image"`
}

func main() {
	// Paths relative to Project Root (when running ./generate-ogp)
	contentDir := "./content/products"
	outputDir := "./static/images/ogp"
	fontPath := "./scripts/ogp/assets/font.ttf"

	// Ensure output directory exists
	if err := os.MkdirAll(outputDir, 0755); err != nil {
		log.Fatal(err)
	}

	files, err := filepath.Glob(filepath.Join(contentDir, "*", "index.md"))
	if err != nil {
		log.Fatal(err)
	}

	for _, file := range files {
		fmt.Printf("Processing %s...\n", file)
		if err := generateOGP(file, outputDir, fontPath); err != nil {
			log.Printf("Error processing %s: %v\n", file, err)
		}
	}
}

func generateOGP(mdPath, outputDir, fontPath string) error {
	fm, err := parseFrontMatter(mdPath)
	if err != nil {
		return err
	}

	projectDir := filepath.Dir(mdPath)
	imagePath := filepath.Join(projectDir, fm.Image)
	projectName := filepath.Base(projectDir)
	outputPath := filepath.Join(outputDir, projectName+".png")

	// Setup Context
	const width = 1200
	const height = 630
	const margin = 80

	dc := gg.NewContext(width, height)
	dc.SetColor(color.White)
	dc.Clear()
	// Layout Constants
	const iconSize = 250.0
	const iconTextGap = 60.0
	const textBlockGap = 40.0 // Reduced gap based on user feedback

	// 1. Prepare Content & Calculations

	// Layout Config
	textX := float64(margin) + iconSize + iconTextGap
	textWidth := float64(width) - textX - float64(margin)

	// Load Fonts to measure
	if err := dc.LoadFontFace(fontPath, 80); err != nil {
		return fmt.Errorf("could not load title font: %v", err)
	}

	titleLines := wrapText(dc, fm.Title, textWidth)
	titleLineHeight := 80.0 * 1.25
	titleBlockHeight := float64(len(titleLines)) * titleLineHeight

	if err := dc.LoadFontFace(fontPath, 40); err != nil {
		return fmt.Errorf("could not load desc font: %v", err)
	}

	descLines := wrapText(dc, fm.Description, textWidth)
	descLineHeight := 40.0 * 1.5
	descBlockHeight := float64(len(descLines)) * descLineHeight

	// Total Text Block Height (Title + Gap + Desc)
	totalTextHeight := titleBlockHeight + textBlockGap + descBlockHeight

	// Vertical Center for Text Block (Top Y coordinate)
	// Align the entire block (Title + Desc) to the vertical center.
	// The layout boxes are mathematically correct.
	textBlockStartY := (float64(height) - totalTextHeight) / 2.0

	// 2. Draw Icon (Vertically Centered)
	iconImg, err := gg.LoadImage(imagePath)
	if err == nil {
		iw := iconImg.Bounds().Dx()
		ih := iconImg.Bounds().Dy()
		scale := iconSize / float64(iw)
		if float64(ih)*scale > iconSize {
			scale = iconSize / float64(ih)
		}

		dc.Push()
		centerX := float64(margin) + iconSize/2
		centerY := float64(height) / 2
		dc.Translate(centerX, centerY)
		dc.Scale(scale, scale)
		dc.DrawImageAnchored(iconImg, 0, 0, 0.5, 0.5)
		dc.Pop()
	} else {
		// Placeholder
		dc.DrawCircle(float64(margin)+iconSize/2, float64(height)/2, iconSize/2)
		dc.SetColor(color.RGBA{240, 240, 240, 255})
		dc.Fill()
	}

	// 3. Draw Title
	if err := dc.LoadFontFace(fontPath, 80); err != nil {
		return err
	}
	dc.SetColor(color.Black)

	currentY := textBlockStartY
	// Draw Title Lines - Vertically Centered in their Line Box
	for _, line := range titleLines {
		halfH := titleLineHeight / 2
		dc.DrawStringAnchored(line, textX, currentY+halfH, 0, 0.5)
		currentY += titleLineHeight
	}

	// 4. Draw Description
	if err := dc.LoadFontFace(fontPath, 40); err != nil {
		return err
	}
	dc.SetColor(color.RGBA{80, 80, 80, 255})

	// Gap
	currentY = textBlockStartY + titleBlockHeight + textBlockGap

	// Draw Description Lines - Vertically Centered in their Line Box
	for _, line := range descLines {
		halfH := descLineHeight / 2
		dc.DrawStringAnchored(line, textX, currentY+halfH, 0, 0.5)
		currentY += descLineHeight
	}

	return dc.SavePNG(outputPath)
}

// wrapText tokenizes text into words (for English) or chars (for Japanese)
// and fits them into maxWidth.
func wrapText(dc *gg.Context, text string, maxWidth float64) []string {
	var lines []string

	// 1. Tokenize
	tokens := tokenize(text)

	// 2. Build lines
	var currentLine string
	for _, token := range tokens {
		// If adding token exceeds width...
		testLine := currentLine + token
		w, _ := dc.MeasureString(testLine)

		if w > maxWidth {
			if currentLine != "" {
				lines = append(lines, strings.TrimSpace(currentLine)) // Trim trailing space potentially
				// Start new line with this token (trim leading space if it's a spacer)
				currentLine = strings.TrimLeft(token, " ")
			} else {
				// Token itself is too long, force add it (or could split it more but rare)
				lines = append(lines, token)
				currentLine = ""
			}
		} else {
			currentLine = testLine
		}
	}
	if currentLine != "" {
		lines = append(lines, strings.TrimSpace(currentLine))
	}

	return lines
}

func tokenize(text string) []string {
	var tokens []string
	var currentToken strings.Builder

	runes := []rune(text)
	for i, r := range runes {
		if r <= 127 { // ASCII
			if r == ' ' {
				// Space is a separator, but also part of the previous word usually?
				// Common strategy: "Word " is a token.
				// If we have "Hello World", tokens: ["Hello ", "World"]
				// If "Hello" fits but "Hello World" doesn't, we break.
				// Next line starts with "World". Correct.
				currentToken.WriteRune(r)
			} else {
				currentToken.WriteRune(r)
			}
		} else {
			// Non-ASCII (Japanese etc)
			// Flush current ASCII token if any
			if currentToken.Len() > 0 {
				tokens = append(tokens, currentToken.String())
				currentToken.Reset()
			}
			// Add this char as a standalone token
			tokens = append(tokens, string(r))
		}

		// Lookahead to see if we should split ASCII token?
		// e.g. "Word" followed by "世". "Word" should be flushed.
		if currentToken.Len() > 0 && i < len(runes)-1 {
			nextR := runes[i+1]
			if nextR > 127 {
				tokens = append(tokens, currentToken.String())
				currentToken.Reset()
			}
		}
	}

	if currentToken.Len() > 0 {
		tokens = append(tokens, currentToken.String())
	}

	return tokens
}

func parseFrontMatter(path string) (*FrontMatter, error) {
	data, err := ioutil.ReadFile(path)
	if err != nil {
		return nil, err
	}

	content := string(data)
	if !strings.HasPrefix(content, "---") {
		return nil, fmt.Errorf("no front matter found")
	}

	parts := strings.SplitN(content, "---", 3)
	if len(parts) < 3 {
		return nil, fmt.Errorf("invalid front matter format")
	}

	var fm FrontMatter
	if err := yaml.Unmarshal([]byte(parts[1]), &fm); err != nil {
		return nil, err
	}

	return &fm, nil
}
