import { Component, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { NotesService } from '../services/notes.service';
import { Note } from '../interfaces/note';
import { Pipe, PipeTransform } from '@angular/core';




@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  constructor(public notesService: NotesService, private alertCtrl: AlertController, private navCtrl: NavController) {

  }

  ngOnInit() {
    this.notesService.load();
  }

  // Adding a new note. Collecting the title with alertCtrl

  addNote(note) {

    this.alertCtrl.create({
      header: 'New Entry',
      message: 'What is on your mind?',
      inputs: [
        {
          type: 'text',
          name: 'title'
        }

      ],
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Save',
          handler: (data) => {
            this.notesService.createNote(data.title);
          }
        }
      ]
    }).then((alert) => {
      alert.present();
    });

  }

  async showInfo() {
    {
      const alert = await this.alertCtrl.create({
        header: 'How it works',
        subHeader: 'Diary',
        // tslint:disable-next-line: max-line-length
        message: 'Press the topright icon to write a new entry. Give it a name and tap it to edit. The content will be saved automatically :)',
        buttons: ['Got It! :)']
      });

      await alert.present();
    }

  }

}
