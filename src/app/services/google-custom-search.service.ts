import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpResponse } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class GoogleCustomSearchService {

  constructor() { }

  async getGoogleSearchData(engine: string, searchTerm: any, start: any) {

    console.log("searchEngine -->" + engine)

    let url = "https://www.googleapis.com/customsearch/v1?key=<replace-this-with-the-key>&cx=" + engine + "&q="+ searchTerm + "&start=" + start;

    // c0ff503eb6f3f42e - spritual info
    // 27cefe246393047f6 - hindu temples
    // 617cca47f286247c1 - sanskrit related

    const options = {
      url: url,
      headers: { 'Content-Type': 'application/json' },
    };
    const response: HttpResponse = await CapacitorHttp.get(options);
    const res = response.data
    return res

  }
}
