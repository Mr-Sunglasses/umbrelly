# Umbrel Config Generator

A modern web application to generate configuration files for Umbrel apps. Built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui.

## Features

- 🎨 Beautiful, modern UI with real-time YAML preview
- 📝 Interactive form with all required fields for umbrel-app.yml
- ℹ️ Helpful tooltips and field descriptions
- ✅ Input validation (lowercase IDs, proper formatting)
- 📋 Copy to clipboard functionality
- 💾 Download generated YAML files
- 🎯 Type-safe TypeScript implementation

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build

```bash
npm run build
npm start
```

## Usage

1. Select the file type from the sidebar (currently umbrel-app.yml is available)
2. Fill in the form fields with your app information
3. Watch the YAML configuration update in real-time
4. Copy or download the generated configuration

## Fields

### Required Fields

- **Manifest Version**: Choose between 1 or 1.1
- **ID**: Unique identifier (lowercase and dashes only)
- **Category**: App category (files, bitcoin, media, etc.)
- **Name**: Display name of your app
- **Version**: App version
- **Tagline**: Short description
- **Description**: Detailed app description
- **Developer**: Developer name
- **Website**: Official website URL
- **Repository**: GitHub/GitLab repository URL
- **Support**: Support URL
- **Port**: Port number for the app
- **Submitter**: Name of the person submitting
- **Submission**: Pull request URL

### Optional Fields

- **Release Notes**: What's new in this version
- **Dependencies**: Other required Umbrel apps
- **Gallery**: Screenshot URLs
- **Path**: Custom access path
- **Default Username**: Default auth username
- **Default Password**: Default auth password

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **js-yaml** - YAML generation
- **Lucide React** - Icons

## License

MIT

