import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpResponse } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class WikiLocSearchService {

  constructor() { }

  async getWikiPlaceLocationData(searchTerm: string) {
    // let url = "https://en.wikipedia.org/w/api.php?action=query&prop=coordinates&format=json&titles=Srirangam"
    let url = "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=coordinates&titles=" + searchTerm

    const options = {
      url: url,
      headers: { 'Content-Type': 'application/json' },
    };
    const response: HttpResponse = await CapacitorHttp.get(options);
    const res = response.data
    
    console.log("Response - getWikiData "+ JSON.stringify(res))
    return res;
  }

  async getWikiNearLocationData(lat: string, lon: string) {
    // let url = "https://en.wikipedia.org/w/api.php?action=query&list=geosearch&format=json&gscoord=" + "10.87|78.68" + "&gsradius=10000&gslimit=2";
    let url = "https://en.wikipedia.org/w/api.php?action=query&list=geosearch&format=json&gsradius=10000&gslimit=6&gscoord=" + lat + "|" + lon;

    const options = {
      url: url,
      headers: { 'Content-Type': 'application/json' },
    };
  
    const response: HttpResponse = await CapacitorHttp.get(options);
    const res = response.data

    console.log("Response - getWikiNearLocationData "+ JSON.stringify(res))
    return res;
  
  }

}
