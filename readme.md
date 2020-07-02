<!-- PROJECT LOGO -->
<p align="center">
  <a href="https://github.com/XjSv/environment-marker">
    <img src="images/icons/environment-marker-256.png" alt="Logo" width="256" height="256">
  </a>

  <h3 align="center">Environment Marker</h3>

  <p align="center">
    A Firefox Addon
    <br />
    <br />
    <a href="https://addons.mozilla.org/en-US/firefox/addon/environment-marker/">Firefox Addons</a>
    ·
    <a href="https://github.com/XjSv/environment-marker/issues">Report Bug</a>
    ·
    <a href="https://github.com/XjSv/environment-marker/issues">Request Feature</a>
  </p>
</p>



<!-- TABLE OF CONTENTS -->
## Table of Contents

* [About the Project](#about-the-project)
  * [Built With](#built-with)
* [Usage](#usage)
* [Roadmap](#roadmap)
* [Contributing](#contributing)
* [License](#license)
* [Contact](#contact)
* [Acknowledgements](#acknowledgements)



<!-- ABOUT THE PROJECT -->
## About The Project

<p align="center">
  <img width="450" height="400" src="screenshots/Environment-Marker.jpg">
</p>

A Firefox WebExtension that adds a color marker (ribbon) to the page depending on whether the URL contains a given string (e.g. 'ht<span>tp://</span>dev-', 'ht<span>tp://</span>qa-',  'ht<span>tp://</span>prod-'). It uses JavaScript's indexOf to determine if the string is found.

Features:
* Configurable Ribbons - Add a URL or part of a URL, choose a color and a ribbon will be added to the page for any website that matches part of that URL. Here are some examples:

  - github.com
  - ht<span>tps://</span>github.com
  - ht<span>tps://</span>github.com/XjSv/environment-marker
  - ht<span>tp://</span>dev.
  - ht<span>tp://</span>qa.
  - ht<span>tp://</span>prod.
  - environment-marker
  
* Configurable Ribbon Positions - Choose where to position the ribbon (top left, top right, bottom left, bottom right).
* Ribbon Labels - Displays a label on the ribbon.
* Tab Counter - Displays the number of open tabs. Color is green when under 10 tabs and red when above. I plan to make this configurable in the future.

### Built With
* [Firefox Developer Edition](https://www.mozilla.org/en-US/firefox/developer/)
* [Font Awesome](https://fontawesome.com/)
* [Pickr](https://simonwep.github.io/pickr/)


<!-- USAGE EXAMPLES -->
## Usage

There are a couple of options for usage.

### 1 - Build & Install From File

**Note:** A pre-built file is located in: build/environment-marker.zip

To build it simply compress the following files/folders using Zip.

- images/
- popup/
- background.js
- content-script.js
- content-style.css
- manifest.json

**Step 1** - Navigate to: <a target="_blank" href="about:addons">about:addons</a>

**Step 2** - Choose the "Install Add-on From File..."
<p align="center">
  <img width="450" height="400" src="screenshots/Install-From-File.jpg">
</p>

**Step 3** - Select build/environment-marker.zip

### 2 - Install From Firefox.com
<a target="_blank" href="https://addons.mozilla.org/en-US/firefox/addon/environment-marker/">Firefox Addons</a>



<!-- ROADMAP -->
## Roadmap

See the [open issues](https://github.com/XjSv/environment-marker/issues) for a list of proposed features (and known issues).



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



<!-- LICENSE -->
## License

Distributed under the MPL-2.0 License. See `LICENSE` for more information.



<!-- CONTACT -->
## Contact

Armand Tresova - [@_XjSv_](https://twitter.com/_XjSv_) - atresova@gmail.com

Project Link: [https://github.com/XjSv/environment-marker](https://github.com/XjSv/environment-marker)



<!-- ACKNOWLEDGEMENTS -->
## Acknowledgements
* [Font Awesome](https://fontawesome.com/)
* [Pickr](https://simonwep.github.io/pickr/)
