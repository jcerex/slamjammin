import React, { Component } from 'react';
import firebase from 'firebase';

export default class Library extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
    };

    var storage = firebase.storage();
    var pathReference = storage.ref('blobs/01bde09e-a726-11e6-9234-0123456789ab.wav');
    // pathReference not correct

    pathReference.getDownloadURL().then(function(url) {
      // Get the download URL for 'images/stars.jpg'
      // This can be inserted into an <img> tag
      // This can also be downloaded directly
      console.log('url', url);
    }).catch(function(error) {
      // Handle any errors
      switch (error.code) {
        case 'storage/object_not_found':
          console.log("File doesn't exist");
          break;

        case 'storage/unauthorized':
          console.log("User doesn't have permission to access the object");
          break;

        case 'storage/canceled':
          console.log("User canceled the upload");
          break;

        case 'storage/unknown':
          console.log("Unknown error occurred, inspect the server response");
          break;
      }
    });
  }

  render() {
    return (
      <p>Library Component</p>
    );
  }
}
