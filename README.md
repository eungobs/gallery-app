Gallery App
Overview
The Gallery App is a React Native application that allows users to capture, save, and manage photos taken with their device's camera. The app provides features for browsing saved images, filtering them by name, and viewing the location associated with each photo.

Features
Capture photos using the device's camera.
Save photos along with their timestamps and location data.
View a gallery of saved images.
Search photos by name.
Open the location of each photo in Google Maps.
Delete photos from the gallery.
Prerequisites
Node.js: Download and install from Node.js official website.
Expo CLI: Install the Expo CLI globally by running:

npm install -g expo-cli
Expo Go: Download the Expo Go app on your mobile device from the App Store (iOS) or Google Play Store (Android).
Installation
Clone the repository:

git clone https://github.com/eungobs/gallery-app.git
cd GalleryApp
Install dependencies:

npm install
Start the development server:

npm start
Run the app:
Scan the QR code using Expo Go on your mobile device, or run it on an emulator.
APK
You can download the pre-built APK from the following link:

Download APK https://drive.google.com/file/d/1xwreyxio414RMi0gW5WEbVbwkmmQi7so/view?usp=sharing

Usage
Grant Permissions: When the app runs for the first time, it will request permission to access the camera and location services. Make sure to grant these permissions for the app to function correctly.

Capture Photos: Tap on the camera icon to take a photo. The captured photo will be displayed for saving.

Save Photos: After capturing a photo, you can save it to the gallery and view its details including the name, date, and location.

View Gallery: Tap the folder icon to view the saved images. You can search for specific photos by name.

Delete Photos: Use the delete button next to each image to remove it from the gallery.

View Location: Tap the location icon to open the corresponding photo location in Google Maps.

Technologies Used
React Native: JavaScript framework for building native mobile applications.
Expo: Framework and platform for Universal React applications.
SQLite: Embedded SQL database engine for storing image data locally.
Database Operations
Initialize Database: Sets up the SQLite database and creates a table for storing images.
Add Image: Inserts a new image entry into the database.
Get All Images: Retrieves all images from the database.
Delete Image: Deletes a specific image entry from the database.
Development
To contribute or customize the application, follow the standard Git workflow:

Create a feature branch for your changes.
Make changes and commit them.
Push your branch to the repository.
Open a pull request.
Troubleshooting
If the app does not load or crashes, ensure all permissions are granted.
If you encounter any issues related to the database, check the console logs for detailed error messages.
