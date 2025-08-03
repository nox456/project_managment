# Project managment (Web Programming Project)

## Development

### Prerequisites

- [Node.js](https://nodejs.org/en/)
- [npm](https://www.npmjs.com/)

- Clone the repository
- Go to the project directory
- Run `npm install`
- Run `npm run dev`

You will see the dev server url in the console. Open it in your browser.

### Project Architecture

```
.
public -> static files (images, icons, etc.)
└── vite.svg
src
├── pages -> pages folder
│   ├── dashboard -> dashboard page
│   │   └── index.html -> dashboard html file
│   │   └── script.js -> dashboard js file
│   │   └── style.css -> dashboard css file
│   ├── materials -> materials page
│   │   └── index.html -> materials html file
│   │   └── script.js -> materials js file
│   │   └── style.css -> materials css file
│   ├── staff -> staff page
│   │   └── index.html -> staff html file
│   │   └── script.js -> staff js file
│   │   └── style.css -> staff css file
│   ├── tasks -> tasks page
│   │   └── index.html -> tasks html file
│   │   └── script.js -> tasks js file
│   │   └── style.css -> tasks css file
│   └── index.html
├── index.html -> main html file
└── style.css -> main css file
db -> database folder
└── data.js -> js file with the stored data
```
