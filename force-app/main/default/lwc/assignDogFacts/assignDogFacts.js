import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const COLUMNS = [
    {label: 'Breed Name', fieldName: 'breedName', type: 'text', sortable: true},
    {label: 'Minimum Life', fieldName: 'lifeMin', type: 'number',
        cellAttributes: { alignment: 'left' }},
    {label: 'Maximum Life', fieldName: 'lifeMax', type: 'number',
        cellAttributes: { alignment: 'left' }},
    {label: 'Description', fieldName: 'description', type: 'text'},
    {label: 'Hypoallergenic', fieldName: 'hypoallergenic', type: 'boolean'}

]

export default class AssignDogFacts extends LightningElement {
    data = [];
    columns = COLUMNS;
    selectedRows = [];
    defaultSortDirection = 'asc';
    sortDirection = 'asc';
    sortedBy;

    getBreedsHandler() {
        const API_URL = 'https://dogapi.dog/api/v2/breeds';

        fetch(API_URL).then(res => res.json()).then(result => {
            this.data = this.processData(result.data);

        }).catch(error => {
            console.log('Error: ', error);
        })
    }

    processData(info) {
        const processedData = info.map(item => ({
            id: item.id,
            breedName: item.attributes.name,
            description: item.attributes.description,
            lifeMax: item.attributes.life.max,
            lifeMin: item.attributes.life.min,
            hypoallergenic: item.attributes.hypoallergenic,
        }));
        return processedData;
    }

    handleRowSelection(event) {
        this.selectedRows = [...event.detail.selectedRows];
        console.log('selectedRows: ', JSON.stringify(this.selectedRows));
    }

    handleAssign() {
        if (this.selectedRows.length === 0) {
            this.dispatchEvent( new ShowToastEvent({
                title: 'Error',
                message: 'Please select at least one breed',
                variant: 'error'
            }));
        }
    }


    // Used to sort the 'Breed Name' column
    sortBy(field, reverse, primer) {
        const key = primer
            ? function (x) {
                  return primer(x[field]);
              }
            : function (x) {
                  return x[field];
              };

        return function (a, b) {
            a = key(a);
            b = key(b);
            return reverse * ((a > b) - (b > a));
        };
    }

    onHandleSort(event) {
        const { fieldName: sortedBy, sortDirection } = event.detail;
        const cloneData = [...this.data];

        cloneData.sort(this.sortBy(sortedBy, sortDirection === 'asc' ? 1 : -1));
        this.data = cloneData;
        this.sortDirection = sortDirection;
        this.sortedBy = sortedBy;
    }
}