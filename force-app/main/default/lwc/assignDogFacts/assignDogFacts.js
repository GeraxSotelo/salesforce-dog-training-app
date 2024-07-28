import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const COLUMNS = [
    {label: 'Breed Name', fieldName: 'Breed_Name__c', type: 'text', sortable: true},
    {label: 'Minimum Life', fieldName: 'Minimum_Life__c', type: 'number',
        cellAttributes: { alignment: 'left' }},
    {label: 'Maximum Life', fieldName: 'Maximum_Life__c', type: 'number',
        cellAttributes: { alignment: 'left' }},
    {label: 'Description', fieldName: 'Description__c', type: 'text'},
    {label: 'Hypoallergenic', fieldName: 'Hypoallergenic__c', type: 'boolean'}

]

export default class AssignDogFacts extends LightningElement {
    data = [];
    columns = COLUMNS;
    firstName = '';
    lastName = '';
    email = '';
    selectedRows = [];
    defaultSortDirection = 'asc';
    sortDirection = 'asc';
    sortedBy;
    inputVariables = [];
    renderFlow = false;

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
            Breed_Name__c: item.attributes.name,
            Description__c: item.attributes.description,
            Maximum_Life__c: item.attributes.life.max,
            Minimum_Life__c: item.attributes.life.min,
            Hypoallergenic__c: item.attributes.hypoallergenic,
        }));
        return processedData;
    }

    handleRowSelection(event) {
        this.selectedRows = [...event.detail.selectedRows];
    }

    handleFirstNameChange(event) {
        this.firstName = event.target.value;
    }

    handleLastNameChange(event) {
        this.lastName = event.target.value;
    }

    handleEmailChange(event) {
        this.email = event.target.value;
    }

    handleAssign() {
        if (this.selectedRows.length === 0) {
            this.dispatchEvent( new ShowToastEvent({
                title: 'Error',
                message: 'Please select at least one breed',
                variant: 'error'
            }));
        } else {
                this.inputVariables = [
                    {
                        name: 'assignDogFactsCollection',
                        type: 'SObject',
                        value: this.selectedRows
                    }
                ];
            this.renderFlow = true;
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