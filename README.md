<p align="center">
  <img width="223" height="223" src="https://i.imgur.com/ouuNaGu.png"></img><br>
  <b>launchbox</b>: an open-source Roblox launcher.
</p>

## Overview
- **Native multi-account support.** Add accounts through Roblox's own authentication process and switch between them easily without having to re-login between accounts every time.
- **Browser-based navigation.** The built-in browser allows you to use the Roblox website directly to add experiences, VIP servers, and accounts to the launcher. No need to go through weird, unofficial forms.
- **Looks and feels good.** Featuring an animated and reactive user interface that can be styled with stylesheets if desired, it will automatically switch between light and dark mode based on your system settings.
- **Cross-platform.** It works on both Windows _and_ macOS!

## Roadmap
- [x] Native browser with cookie and session access.
- [x] User authentication and session reuse through the browser.
- [x] Quick join through launching a game with the browser.
- [x] Save favorite games to the launcher directly for convenience.
- [x] Thumbnails for account headshots and games.
- [ ] Join through Job IDs, private VIP server invites and friends.
- [ ] Additional user configuration (specific Roblox versions? Fast flags?)

## Installation
You can download the [latest build on the releases page.](https://github.com/ccreaper/launchbox/releases) Otherwise, you may also clone the repository and install it directly through `npm`:
```sh
# Clone the repository.
git clone https://github.com/ccreaper/launchbox.git

# Enter the repo's directory.
cd launchbox

# Install and build launchbox.
npm install
npm run build

# Launch launchbox. If you are in VSCode, you may also press 'F5'.
npm run start-gui
```

## Development
You can simply run `npm run autodev` in your terminal to run the watch script, which will automatically re-compile source file when necessary as you work on the codebase. If you have [Visual Studio Code](https://code.visualstudio.com/) installed, you can simply run the autodev script in your terminal and then press `F5` at any time to launch the application.