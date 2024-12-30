# Getting started

This will help you to use this as a reference.

## Requirements

- Node.js 18+
- Windows 10+, Windows Server 2016+ or Windows Subsystem for Linux (WSL).
- macOS 13 Ventura, or later.
- Debian 12, Ubuntu 22.04, Ubuntu 24.04, on x86-64 and arm64 architecture.

=> Use your own versions, if it's not working then update the two to lts versions.

## Spin up app server

Setup the SUT server following the guided provided by `Cô Hạnh`. You can find them here [sut_sharebu](https://github.com/ttbhanh/sut-sharebug)

## Install deps

1. First install specified deps

```bash
npm install
```

2. Install Playwright browser binaries and their deps

```bash
npx playwright install --with-deps
```

## Update env variables

If you have any customization on sut_sharebug config

> > create `.env` off of `.env.example` and change them as your customization

Else

> > copy `.env.example` to `.env`

# What's next?

Head to [Playwright Docs](https://playwright.dev/docs/intro) to look up what you want to use.
