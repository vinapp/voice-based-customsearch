import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpResponse } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class WikiSearchService {

  constructor() { }

  async getWikiData(searchTerm: string, wikicount: any) {
    // let url = "https://www.blogger.com/feeds/1718519798526247834/posts/default?max-results=9&alt=json&q=label%3Ayoutube%20ಶ್ರೀರಂಗ"
    // let url = "https://kn.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=%E0%B2%B6%E0%B3%8D%E0%B2%B0%E0%B3%80%E0%B2%B0%E0%B2%82%E0%B2%97&sroffset=10&srprop=size"
    let url = "https://kn.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch="+ searchTerm + "&sroffset=" + wikicount;
    const options = {
      url: url,
      // headers: { 'X-Fake-Header': 'Fake-Value' },
      headers: { 'Content-Type': 'application/json' },
      // params: { size: 'XL' },
    };
    const response: HttpResponse = await CapacitorHttp.get(options);
    const res = response.data
    return res
  }
}
