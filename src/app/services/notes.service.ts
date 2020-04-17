import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import { Note } from '../interfaces/note';
import { isNull } from 'util';

@Injectable({
  providedIn: 'root'
})
export class NotesService {

  public notes: Note[] = [];
  public loaded: boolean = false;
  private note: Note;

  constructor(private storage: Storage) {

  }

  // Loading notes from storage

  load(): Promise<boolean> {


    return new Promise((resolve) => {


      this.storage.get('notes').then((notes) => {


        if (notes != null) {
          this.notes = notes;
        }


        this.loaded = true;
        resolve(true);

      });

    });

  }

  // Saving array of notes into the storage

  save(): void {

    this.storage.set('notes', this.notes);
  }

  getNote(id): Note {
    // Return the note that has an id matching the id passed in
    return this.notes.find(note => note.id === id);
  }

  // Creating a note

  createNote(title): void {



    let id = Math.max(...this.notes.map(note => parseInt(note.id)), 0) + 1;

    const date1 = new Date();

    const date = date1.toDateString();

    this.notes.push({
      id: id.toString(),
      title: title,
      content: '',
      date: date.toString()

    });

    this.save();

  }

  deleteNote(note): void {

    // Get the index in the array of the note that was passed in
    let index = this.notes.indexOf(note);

    // Delete that element of the array and resave the data
    if (index > -1) {
      this.notes.splice(index, 1);
      this.save();
    }

  }


}
