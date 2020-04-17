import { Injectable } from '@angular/core';
import { Plugins, CameraResultType, Capacitor, FilesystemDirectory, CameraPhoto, CameraSource } from '@capacitor/core';
import { Platform } from '@ionic/angular';

const { Camera, Filesystem, Storage } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  public photos: Photo[] = [];

  private PHOTO_STORAGE: string = "photos";
  private platform: Platform;

  constructor(platform: Platform) {
    this.platform = platform;
  }

  // Loading a photo. The "if" functionality defines wheter we are using the app with a device or in the web

  public async loadSaved() {

    const photos = await Storage.get({ key: this.PHOTO_STORAGE });
    this.photos = JSON.parse(photos.value) || [];


    if (!this.platform.is('hybrid')) {

      for (let photo of this.photos) {

        const readFile = await Filesystem.readFile({
          path: photo.filepath,
          directory: FilesystemDirectory.Data
        });


        photo.base64 = `data:image/jpeg;base64,${readFile.data}`;
      }
    }
  }


  public async addNewToGallery() {
    // Take a photo
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });

    const savedImageFile = await this.savePicture(capturedPhoto);


    this.photos.unshift(savedImageFile);

    // Saving the photo to storage
    // We are also saving photo data into permanent file storage
    // We are also storing  a reference to all photo filepaths using Storage API

    Storage.set({
      key: this.PHOTO_STORAGE,
      value: this.platform.is('hybrid')
        ? JSON.stringify(this.photos)
        : JSON.stringify(this.photos.map(p => {

          const photoCopy = { ...p };
          delete photoCopy.base64;

          return photoCopy;
        }))
    });
  }


  private async savePicture(cameraPhoto: CameraPhoto) {

    const base64Data = await this.readAsBase64(cameraPhoto);


    const fileName = new Date().getTime() + '.jpeg';
    await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: FilesystemDirectory.Data
    });


    return await this.getPhotoFile(cameraPhoto, fileName);
  }


  private async readAsBase64(cameraPhoto: CameraPhoto) {

    if (this.platform.is('hybrid')) {

      const file = await Filesystem.readFile({
        path: cameraPhoto.path
      });

      return file.data;
    }
    else {

      const response = await fetch(cameraPhoto.webPath!);
      const blob = await response.blob();

      return await this.convertBlobToBase64(blob) as string;
    }
  }


  private async getPhotoFile(cameraPhoto: CameraPhoto, fileName: string): Promise<Photo> {
    if (this.platform.is('hybrid')) {

      const fileUri = await Filesystem.getUri({
        directory: FilesystemDirectory.Data,
        path: fileName
      });


      return {
        filepath: fileUri.uri,
        webviewPath: Capacitor.convertFileSrc(fileUri.uri),
      };
    }
    else {

      return {
        filepath: fileName,
        webviewPath: cameraPhoto.webPath
      };
    }
  }


  public async deletePicture(photo: Photo, position: number) {

    this.photos.splice(position, 1);

    Storage.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos)
    });


    const filename = photo.filepath.substr(photo.filepath.lastIndexOf('/') + 1);
    await Filesystem.deleteFile({
      path: filename,
      directory: FilesystemDirectory.Data
    });
  }

  convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
}

interface Photo {
  filepath: string;
  webviewPath: string;
  base64?: string;
}