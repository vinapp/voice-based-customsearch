import { Component, OnInit } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { CapacitorHttp, HttpResponse } from '@capacitor/core';
import { Map, Overlay, View } from 'ol/index';
import Feature from 'ol/Feature';
import { fromLonLat } from 'ol/proj';
import { OSM, Vector as VectorSource } from 'ol/source';
import { Point } from 'ol/geom';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { useGeographic } from 'ol/proj';
import { defaults as defaultControls} from 'ol/control.js';
import { Popover } from 'bootstrap';
import { FormGroup, FormBuilder, FormsModule } from "@angular/forms";
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { WikiLocSearchService } from '../services/wiki-loc-search.service';

interface SpeechRecognition {
  onstart: any;
  onresult: any;
  onend: any;
  start: any;
  stop: any;
}

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [IonicModule, ExploreContainerComponent, CommonModule, FormsModule],
})

export class Tab3Page implements OnInit {
    recognition: SpeechRecognition | any;
    wikicount = 0
    searchcount = 0
    searchTerm: string = "";
    featureList = [new Feature([])];

    selectedItem = "en-US"
    buttonColor = "primary";
    buttonClickFlag = 0
  
    constructor(public http: HttpClient, private navController: NavController, private wikiLocSearchService: WikiLocSearchService) {
  
      const SpeechRecognition = (<any>window).SpeechRecognition || (<any>window).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      let transcript = ''
      this.recognition.lang = 'en-US';
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
  
  
  ngOnInit(): void {
    var place = [77.5946, 12.9716];
    this.searchcount = 0;
    this.wikicount = 0;
    this.createMap(place);
  }

  startStopSpeak(event: any) {
    if (this.buttonClickFlag) {
      this.recognition.start()
      this.buttonClickFlag = 0
      this.buttonColor = "primary";
    } else {
      this.recognition.stop()
      this.buttonClickFlag = 1
      this.buttonColor = "danger";
    }
  }
  
  async getWikiData() {
    this.wikiLocSearchService.getWikiPlaceLocationData(this.searchTerm).then((res) => {
      if (res) {
        const pages = res.query.pages
        let lat = ''
        let lon = ''
    
        // iterate over the keys in the JSON object
        Object.keys(pages).forEach(key => {
          // check if the value is an object and if so, iterate over its keys
          if (typeof pages[key] === "object") {
            Object.keys(pages[key]).forEach(subKey => {
              // check if the subkey matches the desired element
              if (subKey === "coordinates") {
                console.log("getWikiData " + JSON.stringify(pages[key][subKey]));
                lat = pages[key][subKey][0].lat
                lon = pages[key][subKey][0].lon
              }
            });
          }
        });
    
        if (lat != '' || lon != '') {
          this.wikiLocSearchService.getWikiNearLocationData(lat, lon).then((res) => {
            if (res && res["query"]["geosearch"] != undefined) {
              for (let element of res["query"]["geosearch"]) {
                console.log("Element "+ JSON.stringify(element))
                console.log("Element - lat "+ element.lat)
                console.log("Element - lon "+ element.lon)
                const coordinates = [];
                coordinates.push(element.lon)
                coordinates.push(element.lat)
                const pt = new Point(coordinates)
                const ft = new Feature(pt)
                ft.setProperties ({"place": element.title, "region_name": "element.region_name", "distance": element.dist, "url": "https://en.wikipedia.org/?curid=" + element.pageid, "id": element.pageid})
                this.featureList.push(ft)
              }
              this.createMap([lon, lat]);
            }
          })
        }
      }
    })    
  }

  // Create Openlayes Map
  createMap(place: any[]) {
    let map : any
    if (document.getElementById('map') != undefined) {
      let container = document.getElementById('map');
      if (container != null) {
        container.innerHTML = '';
        let element = document.createElement("div")
        element.id = "popup"
        let map1 = document.getElementById('map');
        if (map1 != null) {
          map1.appendChild(element);
        }
      }
    }

    useGeographic();

    map = new Map({
      target: 'map',
      controls: defaultControls({attribution: false}),
      view: new View({
        center: place,
        zoom: 12,
      }),
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        new VectorLayer({
          source: new VectorSource({
            features: this.featureList,
          }),
          style: {
            'circle-radius': 10,
            'circle-fill-color': 'purple',
          },
        }),
      ],
    });

    console.log("lat - lon "+ JSON.stringify(place))
    console.log("featureList "+ JSON.stringify(this.featureList))
    const element: HTMLElement | null = document.getElementById('popup');
    const newelement: HTMLElement | undefined = element ?? undefined;

    const popup = new Overlay({
      element: newelement,
      stopEvent: false,
    });
  
    map.addOverlay(popup);

    const func = this.goAnOtherPage
    const navFunc = this.navController

    function displayPopupInfo(coordinate: number[], feature: { get: (arg0: string) => any; }) {
      return `      
        <table>
          <tbody>
            <tr><th>        lon: </th><td>${coordinate[0].toFixed(2)}</td></tr>
            <tr><th>        lat: </th><td>${coordinate[1].toFixed(2)}</td></tr>
            <tr><th>      place: </th><td>${feature.get('place')}</td></tr>
            <tr><th>   distance: </th><td>${feature.get('distance')}</td></tr>
            <tr><th>       info: </th><td>
              <div style="white-space: nowrap;width: 150px; overflow: hidden;text-overflow: ellipsis; border: 1px solid #000000;">
              ${feature.get('place')}
              </div>
            </td></tr>
            <tr><th>       link: </th><td> <a href="#" id="${feature.get('id')}">${feature.get('url')}</a></td></tr>
          </tbody>
        </table>`;
    }

    let popover: any
    map.on('click', function (event: { originalEvent: { target: { tagName: string; id: string}; }; pixel: any; coordinate: number[]; }) {
    
      if (popover) {
        if (event.originalEvent.target.tagName.toLowerCase() === 'a') {
          func(navFunc, "details", event.originalEvent.target.id);
        }
        popover.dispose();
        popover = undefined;
      }

      const feature = map.getFeaturesAtPixel(event.pixel)[0];
      const coordinate = map.getCoordinateFromPixel(event.pixel)
      if (!feature) {
        return;
      }
      if (!coordinate) {
        return;
      }
      popup.setPosition([
        coordinate[0] + Math.round(event.coordinate[0] / 360) * 360,
        coordinate[1],
      ]);
      
      popover = new Popover(<any>newelement, {
        container: (<any>newelement).parentElement,
        content: displayPopupInfo(coordinate, feature),
        html: true,
        offset: [0, 20],
        placement: 'top',
        sanitize: false,
      });

      popover.show();

    });

    map.on('pointermove', function (event: { pixel: any; }) {
      const type = map.hasFeatureAtPixel(event.pixel) ? 'pointer' : 'inherit';
      map.getViewport().style.cursor = type;
    });
  }

  async getWikiDummyData() {
    const res = '{"batchcomplete": "","query": {"pages": {"351013": {"pageid": 351013,"ns": 0,"title": "Srirangam","coordinates": [{"lat": 10.87,"lon": 78.68,"primary": "","globe": "earth"}]}}}}'

    const resObj = JSON.parse(res)
    const pages = resObj.query.pages
    let lat = ""
    let lon = ""

    // iterate over the keys in the JSON object
    Object.keys(pages).forEach(key => {
      // check if the value is an object and if so, iterate over its keys
      if (typeof pages[key] === "object") {
        Object.keys(pages[key]).forEach(subKey => {
          // check if the subkey matches the desired element
          if (subKey === "coordinates") {
            console.log(JSON.stringify(pages[key][subKey])); // prints "123 Main St"
            lat = pages[key][subKey][0].lat
            lon = pages[key][subKey][0].lon
          }
        });
      }
    });
    if (lat != '' || lon != '') {
      this.getWikiNearLocationDummyDataLatLon(lat, lon)
    }
  }

  async getWikiNearLocationDummyData(lat: string, lon: string) {
    const res = '{ "batchcomplete": "", "query": { "geosearch": [ { "pageid": 47853519, "ns": 0, "title": "Kandannagar", "lat": 10.87, "lon": 78.68, "dist": 0, "primary": "" }, { "pageid": 40730132, "ns": 0, "title": "Srirangam division", "lat": 10.87, "lon": 78.68, "dist": 0, "primary": "" } ] } }'
    
    const resObj = JSON.parse(res)

    if (resObj["query"]["geosearch"] != undefined) {
      for (let element of resObj["query"]["geosearch"]) {
        console.log("element "+ JSON.stringify(element))
      }
    }
  }

  async getWikiNearLocationDummyDataLatLon(lat: string, lon: string) {
    const res = '{ "batchcomplete": "", "query": { "geosearch": [ { "pageid": 47853519, "ns": 0, "title": "Kandannagar", "lat": 10.87, "lon": 78.68, "dist": 0, "primary": "" }, { "pageid": 40730132, "ns": 0, "title": "Srirangam division", "lat": 10.87, "lon": 78.70, "dist": 0, "primary": "" } ] } }'
    
    const resObj = JSON.parse(res)
    console.log("Response - getWikiNearLocationData "+ JSON.stringify(resObj))
    if (resObj["query"]["geosearch"] != undefined) {
      for (let element of resObj["query"]["geosearch"]) {
        console.log("Element "+ JSON.stringify(element))
        console.log("Element - lat "+ element.lat)
        console.log("Element - lon "+ element.lon)
        const coordinates = [];
        coordinates.push(element.lon)
        coordinates.push(element.lat)
        const pt = new Point(coordinates)
        const ft = new Feature(pt)
        ft.setProperties ({"place": element.title, "distance": element.dist, "url": "https://en.wikipedia.org/?curid=" + element.pageid, "id": element.pageid})
        this.featureList.push(ft)
      }
      this.createMap([lon, lat]);
    }
  }

  public goAnOtherPage(fnc: any, page: any, id: string) {
    const link = "https://en.wikipedia.org/?curid="+ id
    fnc.navigateForward(page, { state : {link} })
  }
}

