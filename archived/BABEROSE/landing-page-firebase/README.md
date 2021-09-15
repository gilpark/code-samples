## Landing Page Template
Basic landing page for firebase with dynamic OG meta tag swapping functionality. 

[live demo](https://babe-landing.herokuapp.com/user/test)

In the project directory, you can run:

`npm i` to install dependencies

`npm run start` to start the react app 

`npm run build` to build the react app. it copies build/index.html and src/config.json to `functions` folder.

`npm run deploy` to deploy project to firebase

### How it works

  ```js
const path = new Path('/user/:assetID')
// using path-parser to define path
// path.test("landing-page-URL/user/test") returns {assetID: test}
// path.test("landing-page-URL/123") returns null

function App() {
    let id = path.test(window.location.pathname)
    const initialState = {
        imageURL: `${appConfig.userImageBaseURL}/${id ? id.assetID : null}.gif`, //appConfig is coming from src/appConfig.json
        resourceFound: false,
        isLoading: true,
        assetID: id ? id.assetID : null
    }

    let [state, setState] = useState(initialState)
    let isFileExist = isFileExist(`${appConfig.userImageBaseURL}/${state.assetID}.gif`)
    //isFileExist method is to check if the given resource is exist on remote server.  
    if (state.isLoading) {
        if (isFileExist){
            setState({...state, resourceFound: true, isLoading: false})
        } else {
            setState({...state, resourceFound: false, isLoading: false})
        }
    }
  return (
      // <GalleryView /> //to use gallery view try this
      swapViews(state)
    )
}
```

### After cloning this project

1. create [firebase project](https://console.firebase.google.com) if you haven't done it.
2. download and install firebase CLI if its not installed yet
    - `npm install -g firebase-tools` 
3. login to your firebase account
    - `firebase login`
4. init this project
    - `firebase init`
    - select hosting, functions
    - select existing project that you create on step 1
5. do your thing to modify the project and simply run following command 'npm run deploy'.\
    - this command will build the react project and copy necessary files(index.html, appConfig.json) to `functions` folder. 

### Project details

#### src/appConfig.json

```json
{

  "metaTitle": "LANDING PAGE TITLE",
  "metaDescription": "DESCRIPTION FOR PREVIEW POST",
  "metaImageBaseURL": "https://XXXX",
  "userImageBaseURL": "https://XXX",
  "landingPageBaseURL": "https://babe-landing.herokuapp.com/user"
}
```
this json config is used in 3 places `src/App.js`, `src/comp/display.js` and `functions/index.js`.

recommend to modify urls or meta tags here to avoid human errors.

#### src/App.js
* main logic for the landing page
* this component grabs browser url path and check if the image exist on remote server
* if the user image is exist, it renders `<DisplayView />`( display.js) or `<PageNotFoundView />` (404.js)   

#### src/comp/display.js
* view component for user image and shareable buttons

#### src/comp/404.js
* view component for 404 error.

#### src/comp/gallery.js
* view component for a gallery view
* use react `portal` if you want to add another HTML elements on the top of the gallery view. Otherwise the click event on the added element wouldn't work.

#### functions/index.js
* simple node & firebase function script for swapping meta tags dynamically
* this functions method grabs `functions/hosting/index.html` on request and modifies meta tags then returns modified version of `index.html`
* make sure if you have index.html inside of `functions/hosting` folder

 ### Change Log

 - 01/21/2020 - Readme.md added (Gil)  
