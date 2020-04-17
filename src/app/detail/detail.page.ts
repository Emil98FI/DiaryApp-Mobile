import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, ActionSheetController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { NotesService } from '../services/notes.service';
import { Note } from '../interfaces/note';
import { PhotoService } from '../services/photo.service';


@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
})
export class DetailPage implements OnInit {

  public note: Note;

  constructor(private route: ActivatedRoute, private notesService: NotesService, private navCtrl: NavController,
    public photoService: PhotoService, private alertCtrl: AlertController, public actionSheetController: ActionSheetController) {





    this.note = {
      id: '',
      title: '',
      content: '',
      date: ''

    };

  }

  ngOnInit() {



    // Getting the id of the note from the URL
    let noteId = this.route.snapshot.paramMap.get('id');

    // Checking that the data is loaded before getting the note

    if (this.notesService.loaded) {
      this.note = this.notesService.getNote(noteId)
    } else {
      this.notesService.load().then(() => {
        this.note = this.notesService.getNote(noteId)
      });
    }

    this.photoService.loadSaved();

  }

  noteChanged() {
    this.notesService.save();
  }

  //Using action sheet controller to before confirming the delete

  async deleteNote() {
    {
      const actionSheet = await this.actionSheetController.create({
        header: 'Are you Sure?',
        buttons: [{
          text: 'Delete',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            this.notesService.deleteNote(this.note);
            this.navCtrl.navigateBack('/notes');
          }
        }, {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel',
          handler: () => {

          }
        }]
      });
      await actionSheet.present();
    }
  }

  async showInfo() {
    {
      const alert = await this.alertCtrl.create({
        header: 'How it works',
        subHeader: 'Photogallery',
        message: 'Having something there you do not want to forget? Take an Image and make it part of your photogallery! :)',
        buttons: ['Got It! :)']
      });

      await alert.present();
    }

  }
}

