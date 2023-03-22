import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { News } from '../news';

@Component({
  selector: 'app-news-detail',
  templateUrl: './news-detail.component.html',
  styleUrls: ['./news-detail.component.css'],
})
export class NewsDetailComponent implements OnInit {
  @Input() public news: News;
  fbSrc;
  timeStamp;
  constructor(public newsModalService: NgbActiveModal) {}

  ngOnInit() {
    this.timeStampMethod();
    this.fbSrc =
      'https://www.facebook.com/sharer/sharer.php?u=' +
      encodeURIComponent(this.news.url) +
      '&amp;src=sdkpreparse';
  }

  goToLink(url: string) {
    window.open(url, '_blank');
  }
  timeStampMethod(){
// Create a new JavaScript Date object based on the timestamp
// multiplied by 1000 so that the argument is in milliseconds, not seconds.
var date = new Date(this.news.datetime * 1000);
    this.timeStamp=date
  }
}
