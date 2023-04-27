
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';


@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
  standalone: true,
  imports: [IonicModule, ExploreContainerComponent, CommonModule, FormsModule],
})

export class DetailsPage implements OnInit {
  
  safeUrl!: SafeResourceUrl;
  
  @ViewChild('someInput') someInput1!: ElementRef;
  
  public placeDetailsPageLink: string = '';

  text: string=''
  imgurl: string= 'https://cdn.pixabay.com/photo/2019/12/26/05/10/pink-4719682_960_720.jpg'
  link: string='https://link.medium.com/JA4amAHFJ5'

  constructor(private router: Router,
              private sanitizer: DomSanitizer,
              private socialSharing: SocialSharing) { 

    const curNav = router.getCurrentNavigation()
    if (curNav !=null && curNav.extras.state) {
      this.placeDetailsPageLink = curNav.extras.state['link'];
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.placeDetailsPageLink)
    }
  }

  ngOnInit() {
  }

  ShareGeneric(parameter: string, placeDetailslink: any){
    // const url = this.link
    const text = parameter+'\n'
    this.socialSharing.share(placeDetailslink, '', '', '')
  }
  
  ShareWhatsapp(){
    this.socialSharing.shareViaWhatsAppToPhone(this.text, this.imgurl, this.link)
  }

  ShareFacebook(){
    this.socialSharing.shareViaFacebookWithPasteMessageHint(this.text, this.imgurl, '' /* url */, 'test')
  }

  SendEmail(){
    this.socialSharing.shareViaEmail('text', 'subject', ['email@address.com'])
  }

  SendTwitter(){
    this.socialSharing.shareViaTwitter(this.text, this.imgurl, this.link)
  }

  SendInstagram(){
    this.socialSharing.shareViaInstagram(this.text, this.imgurl)
  }

}

