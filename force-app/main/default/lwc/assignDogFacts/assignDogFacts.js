import { LightningElement } from 'lwc';

export default class AssignDogFacts extends LightningElement {

    getBreedsHandler() {
        const API_URL = 'https://dogapi.dog/api/v2/breeds';

        fetch(API_URL).then(res => res.json()).then(result => {
            console.log(JSON.stringify(result));
        }).catch(() => {
            console.log('Error');
        })
    }
}