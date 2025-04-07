# Gallery App

## Overview

The **Gallery App** is a mobile application built using **React Native** that allows users to capture, save, and manage photos taken with their device's camera. With this app, you can browse through your saved images, filter them by name, and even view the location associated with each photo.

## Key Features

1. **Capture Photos**: Take pictures using your device's camera directly from the app.

2. **Save Photos**: Each photo you take is saved with important details such as the time it was captured and its location.

3. **View Gallery**: Browse through all your saved images in a convenient gallery format.

4. **Search Photos**: Easily find specific photos by searching for their names.

5. **View Location**: You can open the location of each photo in Google Maps to see where it was taken.

6. **Delete Photos**: Remove any unwanted photos from your gallery with ease.

## Prerequisites

Before you can run the Gallery App, ensure you have a few things set up on your device:

1. **Node.js**: Download and install from the [Node.js official website](https://nodejs.org/).

2. **Expo CLI**: This tool helps develop React Native applications. Install it globally by running the following command in your terminal:
   npm install -g expo-cli
 

3. **Expo Go**: Download the Expo Go app on your mobile device:
   - For iOS: Find it in the App Store.
   - For Android: Find it in the Google Play Store.

## Installation Steps

Here’s how to set up and run the project on your machine:

1. **Clone the Repository**: Download the code for this app from GitHub. Open your terminal and type:

   git clone https://github.com/eungobs/gallery-app.git

2. **Navigate to Project Directory**: Change into the project folder:
 
   cd GalleryApp

3. **Install Dependencies**: Install all the necessary packages that the app requires:

   npm install

4. **Start the Development Server**: Launch the development server with:
   npm start

5. **Run the App**: Scan the QR code using the Expo Go app on your mobile device, or run it on an emulator.

## APK

If you prefer, you can also download the pre-built APK version of the app using this link:
- [Download APK](https://drive.google.com/file/d/1xwreyxio414RMi0gW5WEbVbwkmmQi7so/view?usp=sharing)

## How to Use the App

### Grant Permissions

- When you first run the app, it will request permission to access your camera and location services. Make sure you grant these permissions so that the app can function properly.

### Capture Photos

- Tap the camera icon in the app to take a photo. After capturing, the photo will be displayed for you to save.

### Save Photos

- Once you capture a photo, you can save it to the gallery. You’ll also be able to view details about the photo, such as its name, the date it was taken, and the location.

### View Gallery

- Tap the folder icon to see all your saved images. You can use the search feature to find specific photos by name.

### Delete Photos

- If you want to remove a photo from the gallery, just use the delete button next to the image.

### View Location

- Tap the location icon to open the exact location of the photo in Google Maps, allowing you to see where it was taken.

## Technologies Used

The app is built with various technologies, including:

- **React Native**: A JavaScript framework for building mobile applications.
- **Expo**: A platform that simplifies the process of developing universal React applications.
- **SQLite**: An embedded SQL database engine that stores image data locally.

### Database Operations

- **Initialize Database**: Sets up the SQLite database and creates a table for storing images.
- **Add Image**: Inserts a new photo entry into the database.
- **Get All Images**: Retrieves all photos stored in the database.
- **Delete Image**: Removes a specific photo entry from the database.

## Development and Contributions

If you'd like to contribute to or customize the application, you can follow these general steps:

1. Create a feature branch for your changes.
2. Make the desired changes and commit them.
3. Push your branch to the repository.
4. Open a pull request to merge your changes.

## Troubleshooting

- If the app doesn’t load or crashes, ensure all permissions (camera and location access) are granted.
- For any issues with the database, check the console logs for detailed error messages.

