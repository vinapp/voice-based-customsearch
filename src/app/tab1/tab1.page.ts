import { HttpClient } from '@angular/common/http';
import { CapacitorHttp, HttpResponse } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { NavController } from '@ionic/angular';
import { WikiSearchService } from "../services/wiki-search.service"

import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms';
import * as tf from '@tensorflow/tfjs';
import * as tflite from '@tensorflow/tfjs-tflite';

interface SpeechRecognition {
  onstart: any;
  onresult: any;
  onend: any;
  start: any;
  stop: any;
}

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonicModule, ExploreContainerComponent, CommonModule, FormsModule],
})

export class Tab1Page implements OnInit {
  recording = false;
  recognition: SpeechRecognition | any;
  items: any = [];
  searchTerm: string = "";
  wikicount = 0
  searchcount = 0
  recordExists = false
  selectedItem = "kn-IN"
  buttonColor = "primary";
  buttonClickFlag = 0

  constructor(public http: HttpClient, private navController: NavController, private wikiSearchService: WikiSearchService) {

    const SpeechRecognition = (<any>window).SpeechRecognition || (<any>window).webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    let transcript = ''
    this.recognition.lang = 'kn-IN';
    this.recognition.continuous = true;

    this.recognition.onstart = () => {
      console.log('Audio capturing started...');
    }

    this.recognition.onresult = (event: any) => { 
      console.log('Speech recognition result:', event.results[0][0].transcript);
      transcript = event.results[event.results.length - 1][0].transcript.trim();
      console.log(`Result received: ${transcript}`);
    
      this.searchTerm = transcript;
    
      const blob = new Blob([event.results[0][0].transcript], { type: 'audio/wav; codecs=LINEAR16' });
      const fileReader = new FileReader();
    
      fileReader.onload = function onload() {
        const arrayBuffer = fileReader.result;
      };
    
      fileReader.readAsArrayBuffer(blob);
    }

    this.recognition.onend = () => {
      console.log('Speech recognition ended.');
    }

    // Start the recognition process
    this.recognition.start();

  }

  ngOnInit() {
    this.searchcount = 0;
    this.wikicount = 0;
  }

  startStopSpeak(event: any) {
    if (this.buttonClickFlag) {
      this.recognition.start()
      this.buttonClickFlag = 0
      this.buttonColor = "secondary";
    } else {
      this.recognition.stop()
      this.buttonClickFlag = 1
      this.buttonColor = "danger";
    }
  }

  async loadSpeechToTextModel() {
    // const model = await tf.loadLayersModel('./hifigan_dr.tflite');
    const text = 'Hello, world! Hello, world! Hello, world! Hello, world!';

    const model = await tf.loadLayersModel('./hifigan_dr.tflite');
    const input = tf.tensor([this.encodeText(text)]);
    const outputTensor = await model.predict(input) as tf.Tensor
    const speech = new SpeechSynthesisUtterance(String.fromCharCode(...outputTensor.dataSync()));
    speechSynthesis.speak(speech);
  }

  encodeText(text: string): number[] {
    // Encode the text as ASCII values
    const textArray = text.split('').map(c => c.charCodeAt(0));
    // Pad the text array with zeros
    const paddedArray = Array.from({ length: 100 }, (_, i) => textArray[i] || 0);
    return paddedArray;
  }

  speakText() {
    // this.loadSpeechToTextModel()
    TextToSpeech.speak({
      text: "search results fetched"
      // text: this.searchTerm
    })
  }

  async getWikiData() {
    this.items = [];
    this.wikiSearchService.getWikiData(this.searchTerm, this.wikicount).then((res) => {
      console.log('result :>> ', JSON.stringify(res));
      if (res && res["query"]["search"] != undefined) {
        for (let element of res["query"]["search"]) {
          console.log("element "+ JSON.stringify(element))
          this.items.push(element)
        }
        this.speakText()
        if (res.continue.sroffset < (this.wikicount + 10) ) {
          this.recordExists = false;
        } else {
          this.recordExists = true;
        }
      } else {
        this.items = [];
        this.recordExists = false;
      }
    }).catch((err) => {
      console.log('err :>> ', err);
    });
  }

  async fetchMoreWikiData(event: any, searchtype: string) {
    console.log('start fetchMore tab-1');

    if (searchtype == "") {
      this.searchcount = this.searchcount + 10;
      this.wikicount = this.wikicount + 10;
    } else if (searchtype == "wiki") {
      this.wikicount = this.wikicount + 10;
    }

    this.wikiSearchService.getWikiData(this.searchTerm, this.wikicount).then((res) => {
      console.log('result - more :>> ', JSON.stringify(res));
      setTimeout(() => {
        event.target.complete();
      }, 900);
      if (res.continue.sroffset < (this.wikicount + 10) ) {
        this.recordExists = false;
      } else {
        this.recordExists = true;
      }
      for (let element of res["query"]["search"]) {
        console.log("element "+ JSON.stringify(element))
        this.items.push(element)
      }
    }).catch((err) => {
      console.log('err :>> ', err);
    });
    
    console.log('End fetchMore tab-1');
  }

  public onLangSelected (event: any) {
    this.recognition.lang = event.target.value;
  }

  public goAnOtherPage(page: any, id: string) {
    const link = "https://kn.wikipedia.org/?curid="+ id
    this.navController.navigateForward(page, { state : {link} })
  }
}

// https://www.youtube.com/watch?v=U063-oyC3DY
// https://www.youtube.com/watch?v=C0GSRPeuDAM
// https://www.youtube.com/watch?v=NLHF3e4eMtA&t=1848s