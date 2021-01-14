import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Place } from './place.model';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

// [
//   new Place(
//   'p1',
//   'thanamalwila',
//   'in the heart of sri lanka',
//   'https://media.architecturaldigest.com/photos/5da74823d599ec0008227ea8/16:9/w_2560%2Cc_limit/GettyImages-946087016.jpg',
//   149.99,
//   new Date('2019-01-31'),
//   new Date('2025-01-31'),
//   'abc'
//      ),
// new Place(
//     'p2',
//     'Swistaland',
//     'ksd;ada klsdkad dld adek alsa;dad klad',
//     'https://miro.medium.com/max/1200/1*hf_TMSMdWm0Q5H59_t8jSg.jpeg',
//     149.99,
//     new Date('2019-01-31'),
//     new Date('2025-01-31'),
//     'abc'
//     ),

//     new Place(
//       'p3',
//       'paris',
//       'jdassda  sdandlda dladnka ,a sakdnsdand sdadlkna',
//       '',
//       149.99,
//       new Date('2019-01-31'),
//       new Date('2025-01-31'),
//       'abc'
//       ),
//       new Place(
//         'p3',
//         'paris',
//         'jdassda  sdandlda dladnka ,a sakdnsdand sdadlkna',
//         'https://www.srbijadanas.com/sites/default/files/styles/full_article_image/public/a/2014/05/29/profimedia-0012551216.jpg',
//         149.99,
//         new Date('2019-01-31'),
//         new Date('2025-01-31'),
//         'abc'
//         ),
//         new Place(
//           'p3',
//           'paris',
//           'jdassda  sdandlda dladnka ,a sakdnsdand sdadlkna',
//           '',
//           149.99,
//           new Date('2019-01-31'),
//           new Date('2025-01-31'),
//           'abc'
//           )
// ]



interface PlaceData {
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;

}
@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([]) ;

  get places(){
     return this._places.asObservable();
  }

  constructor( private authService: AuthService, private http: HttpClient ) { }

  fetchPlaces() {
    return this.http
    .get<{ [key: string]: PlaceData}>('https://ionic-project01.firebaseio.com/offered-places.json')
    .pipe(map( resData => {
        const places = [];
        for (const key in resData) {
          if (resData.hasOwnProperty(key)) {
            places.push(
              new Place (
                key,
                 resData[key].title,
                  resData[key].description,
                  resData[key].imageUrl,
                   resData[key].price,
                    new Date(resData[key].availableFrom),
                     new Date(resData[key].availableTo),
                     resData[key].userId
                     )
               );
          }
        }
        return places;
        // return [];
    }),
    tap(places => {
      this._places.next(places);
    })
  );
  }

  getPlace(id: string) {
    return this.http
    .get<PlaceData>(
      `https://ionic-project01.firebaseio.com/offered-places/${id}.json`
    )
    .pipe(
    map(placeData => {
      return new Place(
        id,
         placeData.title,
          placeData.description,
           placeData.imageUrl,
           placeData.price,
           new Date(placeData.availableFrom),
           new Date(placeData.availableTo),
           placeData.userId
           );
    })
    );
  }

  addPlace(title: string, description: string, price: number, dateFrom: Date, dateTo: Date){
    let generatedId: string;
    const newPlace = new Place(Math.random().toString(),
     title,
      description,
       'https://media.architecturaldigest.com/photos/5da74823d599ec0008227ea8/16:9/w_2560%2Cc_limit/GettyImages-946087016.jpg',
        price,
         dateFrom,
          dateTo,
          this.authService.userId
          );
    return this.http
    .post<{name: string}>(
      'https://ionic-project01.firebaseio.com/offered-places.json', {
      ...newPlace,
       id: null
      })
      .pipe(
        switchMap(resData => {
          generatedId = resData.name;
          return this.places;
        }),
        take(1),
        tap(places => {
          newPlace.id = generatedId;
          this._places.next(places.concat(newPlace));
    })
      );
//     return  this.places.pipe(take(1), delay(1000), tap(places => {
//       this._places.next(places.concat(newPlace));
// })
//     );
  }
  updatePlace(placeId: string, title: string, description: string ) {
    let updatedPlaces: Place[];
    return this.places.pipe(
      take(1), switchMap(places => {
        if (!places || places.length <= 0) {
          return this.fetchPlaces();

        }
        else {
          return of(places);
        }
    }),
    switchMap(places => {
      const updatedPlaceIndex = places.findIndex(pl => pl.id === placeId);
      updatedPlaces = [...places];
      const oldPlace = updatedPlaces[updatedPlaceIndex];
      updatedPlaces[updatedPlaceIndex] = new Place (
        oldPlace.id,
         title,
          description,
           oldPlace.imageUrl,
            oldPlace.price,
             oldPlace.availableFrom,
              oldPlace.availableTo,
               oldPlace.userId
               );
      return this.http.put(
                `https://ionic-project01.firebaseio.com/offered-places/${placeId}.json`,
                 { ...  updatedPlaces[updatedPlaceIndex], id: null }
                );
    }),
                tap(() => {
                  this._places.next(updatedPlaces);

      })
      );

  }
}
