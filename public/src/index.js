import { Observable, of, from, fromEvent, timer, interval, forkJoin, combineLatest, EMPTY, Subject, BehaviorSubject } from 'rxjs';
import { ajax } from "rxjs/ajax";
import { catchError, concatMap, debounceTime, filter, map, tap, withLatestFrom } from "rxjs/operators";
const someObservable$ = new Observable(subscriber => {
    subscriber.next('Alice');
    subscriber.next('Ben');
    subscriber.next('Charlie');
    subscriber.complete();
});
someObservable$.subscribe(value => console.log(value));
//-------------------------------------------------------------------
const interval$ = new Observable(subscriber => {
    let counter = 1;
    const intervalId = setInterval(() => {
        console.log('Emitted', counter);
        subscriber.next(counter++);
    }, 2000);
    return () => {
        clearInterval(intervalId);
    };
});
const subscription = interval$.subscribe(value => console.log(value));
setTimeout(() => {
    console.log('Unsubscribe');
    subscription.unsubscribe();
}, 7000);
//Cold
//-------------------------------------------------------------------
const ajax$ = ajax('https://random-data-api.com/api/name/random_name');
ajax$.subscribe(data => console.log('Sub 1:', data.response.first_name));
ajax$.subscribe(data => console.log('Sub 2:', data.response.first_name));
ajax$.subscribe(data => console.log('Sub 3:', data.response.first_name));
//Hot
//-------------------------------------------------------------------
const helloButton = document.querySelector('button#hello');
const helloClick$ = new Observable(subscriber => {
    helloButton.addEventListener('click', (event) => {
        subscriber.next(event);
    });
});
helloClick$.subscribe(event => console.log('Sub 1:', event.type, event.x, event.y));
setTimeout(() => {
    console.log('Subscription 2 starts');
    helloClick$.subscribe(event => console.log('Sub 2:', event.type, event.x, event.y));
}, 5000);
//Of
//--------------------------------------------------------------------
of('Alice', 'Ben', 'Charlie').subscribe({
    next: value => console.log(value),
    complete: () => console.log('Completed')
});
// ourOwnOf('Alice', 'Ben', 'Charlie').subscribe({
//   next: value => console.log(value),
//   complete: () => console.log('Completed')
// });
// const names$ = new Observable<string>(subscriber => {
//   subscriber.next('Alice');
//   subscriber.next('Ben');
//   subscriber.next('Charlie');
//   subscriber.complete();
// });
// names$.subscribe({
//   next: value => console.log(value),
//   complete: () => console.log('Completed')
// });
// function ourOwnOf(...args: string[]): Observable<string> {
//   return new Observable<string>(subscriber => {
//     for (let i = 0; i < args.length; i++) {
//       subscriber.next(args[i]);
//     }
//     subscriber.complete();
//   });
// }
//From
//--------------------------------------------------------------------
const somePromise = new Promise((resolve, reject) => {
    // resolve('Resolved!');
    reject('Rejected!');
});
const observableFromPromise$ = from(somePromise);
observableFromPromise$.subscribe({
    next: value => console.log(value),
    error: err => console.log('Error:', err),
    complete: () => console.log('Completed')
});
//From event
//--------------------------------------------------------------------
const triggerButton = document.querySelector('button#trigger');
const sub = fromEvent(triggerButton, 'click').subscribe(event => console.log(event.type, event.x, event.y));
// const triggerClick$ = new Observable<MouseEvent>(subscriber => {
//   const clickHandlerFn = (event: MouseEvent) => {
//     console.log('Event callback executed');
//     subscriber.next(event);
//   };
//   triggerButton.addEventListener('click', clickHandlerFn);
//   return () => {
//     triggerButton.removeEventListener('click', clickHandlerFn);
//   };
// });
// const sub = triggerClick$.subscribe(
//   event => console.log(event.type, event.x, event.y)
// );
setTimeout(() => {
    console.log('Unsubscribe');
    sub.unsubscribe();
}, 5000);
//Timer
//----------------------------------------------------------------
const timer$ = timer(2000);
// const timer$ = new Observable<number>(subscriber => {
//   const timeoutId = setTimeout(() => {
//     console.log('Timeout!');
//     subscriber.next(0);
//     subscriber.complete();
//   }, 2000);
//   return () => clearTimeout(timeoutId);
// });
const sub1 = timer$.subscribe({
    next: value => console.log(value),
    complete: () => console.log('Completed')
});
setTimeout(() => {
    sub1.unsubscribe();
    console.log('Unsubscribe');
}, 1000);
//Interval
//--------------------------------------------------------------
const interval1$ = interval(1000);
// const interval1$ = new Observable<number>(subscriber => {
//   let counter = 0;
//   const intervalId = setInterval(() => {
//     console.log('Timeout!');
//     subscriber.next(counter++);
//   }, 1000);
//   return () => clearInterval(intervalId);
// });
const sub2 = interval1$.subscribe({
    next: value => console.log(value),
    complete: () => console.log('Completed')
});
setTimeout(() => {
    sub2.unsubscribe();
    console.log('Unsubscribe');
}, 5000);
//ForkJoin
//----------------------------------------------------------------
const randomName$ = ajax('https://random-data-api.com/api/name/random_name');
const randomNation$ = ajax('https://random-data-api.com/api/nation/random_nation');
const randomFood$ = ajax('https://random-data-api.com/api/food/random_food');
// randomName$.subscribe(ajaxResponse => console.log(ajaxResponse.response.first_name));
// randomNation$.subscribe(ajaxResponse => console.log(ajaxResponse.response.capital));
// randomFood$.subscribe(ajaxResponse => console.log(ajaxResponse.response.dish));
forkJoin([randomName$, randomNation$, randomFood$]).subscribe(([nameAjax, nationAjax, foodAjax]) => console.log(`${nameAjax.response.first_name} is from ${nationAjax.response.capital} and likes to eat ${foodAjax.response.dish}.`));
const a$ = new Observable(subscriber => {
    setTimeout(() => {
        subscriber.next('A');
        subscriber.complete();
    }, 5000);
    return () => {
        console.log('A teardown');
    };
});
const b$ = new Observable(subscriber => {
    setTimeout(() => {
        subscriber.error('Failure!');
    }, 3000);
    return () => {
        console.log('B teardown');
    };
});
forkJoin([a$, b$]).subscribe({
    next: value => console.log(value),
    error: err => console.log('Error:', err)
});
//CombineLatest
//----------------------------------------------------------------
const temperatureInput = document.getElementById('temperature-input');
const conversionDropdown = document.getElementById('conversion-dropdown');
const resultText = document.getElementById('result-text');
const temperatureInputEvent$ = fromEvent(temperatureInput, 'input');
const conversionInputEvent$ = fromEvent(conversionDropdown, 'input');
combineLatest([temperatureInputEvent$, conversionInputEvent$]).subscribe(([temperatureInputEvent, conversionInputEvent]) => {
    const temperature = Number(temperatureInputEvent.target['value']);
    const conversion = conversionInputEvent.target['value'];
    let result;
    if (conversion === 'f-to-c') {
        result = (temperature - 32) * 5 / 9;
    }
    else if (conversion === 'c-to-f') {
        result = temperature * 9 / 5 + 32;
    }
    resultText.innerText = String(result);
});
const newsFeed$ = new Observable(subscriber => {
    setTimeout(() => subscriber.next({ category: 'Business', content: 'A' }), 1000);
    setTimeout(() => subscriber.next({ category: 'Sports', content: 'B' }), 3000);
    setTimeout(() => subscriber.next({ category: 'Business', content: 'C' }), 4000);
    setTimeout(() => subscriber.next({ category: 'Sports', content: 'D' }), 6000);
    setTimeout(() => subscriber.next({ category: 'Business', content: 'E' }), 7000);
});
const sportsNewsFeed$ = newsFeed$.pipe(filter(item => item.category === 'Sports'));
sportsNewsFeed$.subscribe(item => console.log(item));
//Map
//----------------------------------------------------------------
const randomFirstName$ = ajax('https://random-data-api.com/api/name/random_name').pipe(map(ajaxResponse => ajaxResponse.response.first_name));
const randomCapital$ = ajax('https://random-data-api.com/api/nation/random_nation').pipe(map(ajaxResponse => ajaxResponse.response.capital));
const randomDish$ = ajax('https://random-data-api.com/api/food/random_food').pipe(map(ajaxResponse => ajaxResponse.response.dish));
forkJoin([randomFirstName$, randomCapital$, randomDish$]).subscribe(([firstName, capital, dish]) => console.log(`${firstName} is from ${capital} and likes to eat ${dish}.`));
//Tap
//--------------------------------------------------------------
of(1, 7, 3, 6, 2).pipe(filter(value => value > 5), map(value => value * 2), tap({
    next: value => console.log('Spy:', value)
})).subscribe(value => console.log('Output:', value));
//DebounceTime
//--------------------------------------------------------------
const sliderInput = document.querySelector('input#slider');
fromEvent(sliderInput, 'input').pipe(debounceTime(2000), map((event) => event.target['value'])).subscribe(value => console.log(value));
//CatchError
//-------------------------------------------------------------
const failingHttpRequest$ = new Observable(subscriber => {
    setTimeout(() => {
        subscriber.error(new Error('Timeout'));
    }, 3000);
});
console.log('App started');
failingHttpRequest$.pipe(catchError(error => EMPTY)).subscribe({
    next: value => console.log(value),
    complete: () => console.log('Completed')
});
//Concat map 
//------------------------------------------------
const endpointInput = document.querySelector('input#endpoint');
const fetchButton = document.querySelector('button#fetch');
fromEvent(fetchButton, 'click').pipe(map(() => endpointInput.value), concatMap(value => ajax(`https://random-data-api.com/api/${value}/random_${value}`).pipe(catchError(error => of(`Could not fetch data: ${error}`))))).subscribe({
    next: value => console.log(value),
    error: err => console.log('Error:', err),
    complete: () => console.log('Completed')
});
//Subject 
//------------------------------------------------
const emitButton = document.querySelector('button#emit');
const inputElement = document.querySelector('#value-input');
const subscribeButton = document.querySelector('button#subscribe');
const value$ = new Subject();
fromEvent(emitButton, 'click').pipe(map(() => inputElement.value)).subscribe(value$);
fromEvent(subscribeButton, 'click').subscribe(() => {
    console.log('New Subscription');
    value$.subscribe(value => console.log(value));
});
//BehaviorSubject 
//------------------------------------------------
const loggedInSpan = document.querySelector('span#logged-in');
const loginButton = document.querySelector('button#login');
const logoutButton = document.querySelector('button#logout');
const printStateButton = document.querySelector('button#print-state');
const isLoggedIn$ = new BehaviorSubject(false);
fromEvent(loginButton, 'click').subscribe(() => isLoggedIn$.next(true));
fromEvent(logoutButton, 'click').subscribe(() => isLoggedIn$.next(false));
// Navigation bar
isLoggedIn$.subscribe(isLoggedIn => loggedInSpan.innerText = isLoggedIn.toString());
// Buttons
isLoggedIn$.subscribe(isLoggedIn => {
    logoutButton.style.display = isLoggedIn ? 'block' : 'none';
    loginButton.style.display = !isLoggedIn ? 'block' : 'none';
});
fromEvent(printStateButton, 'click').pipe(withLatestFrom(isLoggedIn$)).subscribe(([event, isLoggedIn]) => console.log('User is logged in:', isLoggedIn));
//# sourceMappingURL=index.js.map