# Quick Start Guide

## Installation and Running

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## How to Use

1. **Select a file type** from the sidebar (umbrel-app.yml is currently available)

2. **Fill in the form fields:**
   - Required fields are marked with a red asterisk (*)
   - Hover over the help icon (ℹ️) next to each field for more information
   - The ID field automatically formats to lowercase with dashes only

3. **Watch the live preview:**
   - The YAML preview updates in real-time as you type
   - See exactly what your configuration file will look like

4. **Export your configuration:**
   - Click "Copy" to copy the YAML to your clipboard
   - Click "Download" to download the YAML file

## Field Guidelines

### ID Field
- Only lowercase letters and dashes are allowed
- Example: `my-awesome-app`

### Category Field
Choose from:
- files
- bitcoin
- media
- networking
- social
- automation
- finance
- ai
- developer

### Dependencies
- Enter as comma-separated values
- Example: `bitcoin, lightning`

### Gallery
- Enter image URLs separated by commas
- Leave empty for new app submissions

## Tips

- All required fields must be filled for a valid configuration
- The manifest version determines if you can use hooks (1.1) or not (1)
- Make sure URLs are complete and valid
- Port numbers should be unique and not conflict with other apps

## Next Steps

Once you've generated your umbrel-app.yml:
1. Create your docker-compose.yml (coming soon in this tool!)
2. Test your app locally
3. Submit a PR to the Umbrel apps repository

