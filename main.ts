import { Observable, Observer } from 'rxjs';

let numbers = [ 1, 5, 10 ];
let source1 = Observable.from(numbers);

source1.subscribe(
    value => console.log(`(func array) value: ${value}`),
    e => console.log(`(func array) error: ${e}`),
    () => console.log("(func array) complete")
)
class MyObserver implements Observer<number> {

    constructor(private name: string) {
    }

    next(value) {
        console.log(`(${this.name}) value: ${value}`);
    }

    error(e) {
        console.log(`(${this.name}) error: ${e}`);
    }

    complete() {
        console.log(`(${this.name}) complete`);
    }
}

source1.subscribe(new MyObserver("source1"));

let source2 = Observable.create((observer : Observer<number>) => {

    for(let n of numbers) {
/*
        if(n === 5) {
            observer.error("error !")
        }
*/
        observer.next(n);
    }

    observer.complete();
});

source2.subscribe(new MyObserver("source2"));

let source3 = Observable.create((observer : Observer<number>) => {

    let index = 0;
    let produceValue = () => {
        observer.next(numbers[index++]);

        if(index < numbers.length) {
            setTimeout(produceValue, 2000);
        } else {
            observer.complete();
        }
    }

    produceValue();
}).map(n => n * 2).filter(n => n > 4);

source3.subscribe(new MyObserver("source3"));

class MyMouseObserver implements Observer<MouseEvent> {

    constructor(private name: string) {
    }

    next(value: MouseEvent) {
        onNext(value);
    }

    error(e: Error) {
        console.log(`(${this.name}) error: ${e}`);
    }

    complete() {
        console.log(`(${this.name}) complete`);
    }
}

let circle = document.getElementById("circle");
let source4 = Observable.fromEvent(document, "mousemove")
    .map((e : MouseEvent) => {
        return {
            x: e.clientX,
            y: e.clientY
        }
    })
    .filter(value => value.x < 500)
    .delay(300);

function onNext(value) {
    circle.style.left = value.x;
    circle.style.top = value.y;
}

source4.subscribe(new MyMouseObserver("source4"));

let output = document.getElementById("output");
let button = document.getElementById("button");

let click = Observable.fromEvent(button, "click");

function load(url: string) {
    return Observable.create((observer: Observer<string>) => {
        let xhr = new XMLHttpRequest();
        
            xhr.addEventListener("load", () => {
                if(xhr.status === 200) {
                    let data = JSON.parse(xhr.responseText);
                    observer.next(data);
                    observer.complete();
                } else {
                    observer.error(xhr.statusText);
                }
            });
        
            xhr.open("GET", url);
            xhr.send();
    }).retryWhen(retryStrategy({ attempts: 3, delay: 1500 }));
}

function loadWithFetch(url: string) {

}

function retryStrategy({ attempts = 4, delay = 1000 }) {
    return (errors : Observable<any>) => {
        return errors
            .scan((acc, value) => {
                console.log(acc, value);
                return ++acc;
            }, 0)
            .takeWhile(acc => acc < attempts)
            .delay(delay);
    };
}

function renderMovies(movies) {
    movies.forEach(m => {
        let div = document.createElement("div");
        div.innerText = m.title;
        output.appendChild(div);
    });    
}

/*
click.flatMap(
    e => load("moviess.json")).subscribe(
        renderMovies,
        e => console.log(`(button click) error: ${e}`),
        () => console.log("(button click) complete")
); 
*/

click.flatMap(
    e => load("moviess.json")).subscribe(
        renderMovies,
        e => console.log(`(button click) error: ${e}`),
        () => console.log("(button click) complete")
);