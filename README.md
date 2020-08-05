# Stampin

## Setup
1. Installation of node.js is required. Follow [this guide](https://github.com/itp-dwd/2020-spring/blob/master/guides/installing-nodejs.md) to install it.
2. Run the following commands in the Terminal.
```
git clone https://github.com/OctaviaXR/stampin.git
cd stampin
npm install dependencies
npm start
```
3. Open your web browser and navigate to http://localhost:3000


## Setup For big files - LFS
This is good for large file sizes. For Mac Users, please follow the steps below to install:
1. Install [LFS](https://git-lfs.github.com/)
```
brew update 
brew install git-lfs
git lft install 
```

2. Then go to your repo.
```
git lfs migrate info  //this is to sort big file sizes 
git lfs migrate import --include="*.mp3.ogg.mp4.bin"// put in your example file sizes 
git add .gitattributes
```
