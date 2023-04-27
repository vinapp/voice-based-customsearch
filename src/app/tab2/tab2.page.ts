import { HttpClient } from '@angular/common/http';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { NavController } from '@ionic/angular';
import * as tf from '@tensorflow/tfjs';
import * as tflite from '@tensorflow/tfjs-tflite';
import { Tensor } from '@tensorflow/tfjs-core';

import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms';
import { GoogleCustomSearchService } from '../services/google-custom-search.service';
// import { Tensor } from '@tensorflow/tfjs';

interface SpeechRecognition {
  onstart: any;
  onresult: any;
  onend: any;
  start: any;
  stop: any;
}

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [IonicModule, ExploreContainerComponent, CommonModule, FormsModule],
})

export class Tab2Page implements OnInit {

  recording = false;
  recognition: SpeechRecognition | any;
  items: any = [];
  searchTerm: string = "";
  googlesearchcount = 0
  searchcount = 0
  recordExists = false
  selectedItem = "kn-IN"
  buttonColor = "primary";
  buttonClickFlag = 0
  searchEngineselectedItem = "c0ff503eb6f3f42e0" //Spritual
  searchEngineUpFlag = true
  searchEngineDownFlag = false
  langUpFlag = true
  langDownFlag = false
  synth: any

  constructor(public http: HttpClient, private navController: NavController,  private googleCustomSearchService: GoogleCustomSearchService) {

    const SpeechRecognition = (<any>window).SpeechRecognition || (<any>window).webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    let transcript = ''
    this.recognition.lang = 'kn-IN';
    this.recognition.continuous = true;

    this.recognition.onstart = (event: any) => {
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

    this.recognition.onend = (event: any) => {
      console.log('Speech recognition ended.');
    }

    // Start the recognition process
    this.recognition.start();

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

  ngOnInit() {
    this.searchcount = 0;
    this.googlesearchcount = 0;
  }

  async loadSpeechToTextCustomModel () {
    // Set the URL for the TFLite model file
    const modelUrl = 'https://raw.githubusercontent.com/tulasiram58827/TTS_TFLite/main/models/parallel_wavegan_dr.tflite';

    // const response = await fetch('https://raw.githubusercontent.com/tulasiram58827/TTS_TFLite/main/models/parallel_wavegan_dr.tflite');
    // const modelData = await response.arrayBuffer();
    // tflite.setWasmPath('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-tflite@0.0.1-alpha.9/dist/')
    
    const model = await tflite.loadTFLiteModel(modelUrl);

    // Get the input and output tensors of the model
    const input = model.inputs[0];
    const output = model.outputs[0]

    const inputShape = input.shape;
    const text = 'Hello, how are you?';

    const tensor : Tensor = tf.tensor(text, inputShape) as unknown as Tensor;
    const outputTensor = model.predict(tensor) as Tensor
    const utterance = new SpeechSynthesisUtterance(String.fromCharCode(...outputTensor.dataSync()));

    window.speechSynthesis.speak(utterance);

  }

  speakText() {
    // const utterThis = new SpeechSynthesisUtterance(this.searchTerm);
    // const utterThis = new SpeechSynthesisUtterance("search results are loaded");
    // const utterThis = new SpeechSynthesisUtterance("नमस्कार कैसे हैं आप");
    // const utterThis = new SpeechSynthesisUtterance("ನಮಸ್ಕಾರ ಹೇಗಿದೆರ");
    // utterThis.lang = "hi-IN";
    // utterThis.pitch = 500;
    // utterThis.rate = 0.9;
    // utterThis

    // window.speechSynthesis.speak(utterThis);
    // this.loadSpeechToTextCustomModel()

    TextToSpeech.speak({
      // text: this.searchTerm,
      // lang:'hi-IN',
      // text:"नमस्कार कैसे हैं आप",
      lang:'en-US',
      text: "search results are loaded",

    })
  }

  // Fetch more search data
  async getGoogleSearchData() {
    this.items = [];
    this.googleCustomSearchService.getGoogleSearchData(this.searchEngineselectedItem, this.searchTerm, 0).then((res) => {
      if (res && res["items"] != undefined) {
        for (let element of res["items"]) {
          console.log("element "+ JSON.stringify(element))
          this.items.push(element)
        }
        this.speakText()
        console.log("res.queries.request[0].totalResults "+ res.queries.request[0].totalResults)
        if (res.queries.request[0].totalResults < (this.googlesearchcount + 10) ) {
          this.recordExists = false;
        } else {
          this.recordExists = true;
        }
      } else {
        this.items = [];
        this.recordExists = false;
      }
    });
  }

  // Fetch more search data
  async fetchMoreGoogleSearchData(event: any, searchtype: string) {
    console.log('start fetchMore tab-2');

    if (searchtype == "") {
      this.searchcount = this.searchcount + 10;
      this.googlesearchcount = this.googlesearchcount + 10;
    } else if (searchtype == "googlesearch") {
      this.googlesearchcount = this.googlesearchcount + 10;
    }

    this.googleCustomSearchService.getGoogleSearchData(this.searchEngineselectedItem, this.searchTerm, this.googlesearchcount).then((res) => {
      setTimeout(() => {
        event.target.complete();
      }, 900);
      console.log("res.queries.request[0].totalResults "+ res.queries.request[0].totalResults)
      if (res.queries.request[0].totalResults < (this.googlesearchcount + 10) ) {
        this.recordExists = false;
      } else {
        this.recordExists = true;
      }
      for (let element of res["items"]) {
        console.log("element "+ JSON.stringify(element))
        this.items.push(element)
      }
    })
    console.log('end fetchMore tab-2');

  }

  // HTML events
  public onLangSelected (event: any) {
    this.recognition.lang = event.target.value;
  }

  public onSearchEngineUpDown (event: any) {
    if (event.target.name === 'chevron-up') {
      this.searchEngineUpFlag = true
      this.searchEngineDownFlag = false
    } else {
      this.searchEngineDownFlag = true
      this.searchEngineUpFlag = false
    }
  }
  
  public onLangUpDown (event: any) {
    if (event.target.name === 'chevron-up') {
      this.langUpFlag = true
      this.langDownFlag = false
    } else {
      this.langDownFlag = true
      this.langUpFlag = false
    }
  }

  // Navigate to another page
  public goAnOtherPage(page: any, link: string) {
    this.navController.navigateForward(page, { state : {link} })
  }
}
