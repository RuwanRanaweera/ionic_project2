import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, AlertController, LoadingController, ModalController, NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../auth/auth.service';
import { BookingService } from '../../../bookings/booking.service';
import { CreateBookingComponent } from '../../../bookings/create-booking/create-booking.component';
import { Place } from '../../place.model';
import { PlacesService } from '../../places.service';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  place: Place;
  isBookable = false;
  isLoading = false;
  private placeSub: Subscription;


  constructor(private route: ActivatedRoute,
              private navCtrl: NavController,
              private placeService: PlacesService,
              private modelCtrl: ModalController,
              private actionSheetCtrl: ActionSheetController,
              private bookingService: BookingService,
              private loadingCtrl: LoadingController,
              private authService: AuthService,
              private alertCtrl: AlertController,
              private router: Router
              ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('placeId')){
        this.navCtrl.navigateBack('/places/tabs/discover');
        return;
      }
      this.isLoading = true;
      this.placeSub = this.placeService.getPlace(paramMap.get('placeId')).subscribe(place => {
        this.place = place;
        this.isBookable = place.userId !== this.authService.userId;
        this.isLoading = false;

      }, err => {
          this.alertCtrl.create({
            header: 'An error occured!',
             message: 'Could not load place',
              buttons: [{text: 'Okey', handler: () => {
                this.router.navigate(['/places/tabs/discover']);
          }
        }
      ]
        }).then(alertEl => alertEl.present());
      }
      );

    });
  }
  onBookPlace() {
    this.actionSheetCtrl.create({
      header: 'Choose An Action',
       buttons: [
         {
           text: 'Select Date',
           handler: () => {
             this.openBookingModal('select');
           }
         },
         {
           text: 'Random Date',
           handler: () => {
            this.openBookingModal('random');
           }
         },
         {
           text: 'Cancel',
           role: 'destructive'
         }
       ]
    }).then(actionSheetEl => {
      actionSheetEl.present();
    });
    // this.router.navigateByUrl('/places/tabs/discover');
    //  this.navCtrl.navigateBack('/places/tabs/discover');
    // this.navCtrl.pop();
}
  openBookingModal(mode: 'select' | 'random'){
    console.log(mode);
    this.modelCtrl.create({component: CreateBookingComponent,
      componentProps: {selectedPlace: this.place, selectedMode: mode}
     }).then(modelEl => {
     modelEl.present();
     return modelEl.onDidDismiss();
   })
   .then(resultData => {
      if (resultData.role === 'confirm') {
        this.loadingCtrl
        .create({message: 'Booking place...!'})
        .then(loadingEl => {
          loadingEl.present();
          const data = resultData.data.bookingData;
          this.bookingService.addBooking(
            this.place.id,
             this.place.title,
              this.place.imageUrl,
               data.firstName,
               data.lastName,
               data.guestNumber,
                data.startDate,
                 data.endDate
                 ).subscribe(() => {
                   loadingEl.dismiss();
                 });
        });
      }
   });
  }
  ngOnDestroy(){
    if ( this.placeSub){
      this.placeSub.unsubscribe();
    }
  }
}
