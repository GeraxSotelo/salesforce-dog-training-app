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
    firstName = '';
    lastName = '';
    email = '';
    selectedRows = [];
    records = [];
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

    processData(data) {
        const processedData = data.map(item => ({
            breedName: item.attributes.name,
            description: item.attributes.description,
            lifeMax: item.attributes.life.max,
            lifeMin: item.attributes.life.min,
            hypoallergenic: item.attributes.hypoallergenic
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

    handleAssignDogFacts(event) {
        event.preventDefault();
        if (this.selectedRows.length === 0) {
            this.dispatchEvent( new ShowToastEvent({
                title: 'Error',
                message: 'Please select at least one breed',
                variant: 'error'
            }));
        } else {
            this.createRecordData(this.selectedRows);
            this.inputVariables = [
                {
                    name: 'assignDogFactsCollection',
                    type: 'SObject',
                    value: this.records
                }
            ];
            this.renderFlow = true;
        }
    }

    createRecordData(data) {
        const fullName = `${this.firstName} ${this.lastName}`
        console.log('Full Name: ' , fullName);
        this.records = data.map(item => ({ 
            Name: fullName.trim().length === 0  ? item.breedName : `${fullName.trim()} - ${item.breedName}`,
            Assigned_To__c: fullName,
            Email__c: this.email,
            Breed_Name__c: item.breedName,
            Description__c: item.description,
            Maximum_Life__c: item.lifeMax,
            Minimum_Life__c: item.lifeMin,
            Hypoallergenic__c: item.hypoallergenic
        }))
    }

    handleStatusChange(event) {
        if (event.detail.status === "FINISHED_SCREEN") {
            this.dispatchEvent( new ShowToastEvent({
                title: 'Success',
                message: 'Dog breed facts have been assigned',
                variant: 'success'
            }));
            this.renderFlow = false;
        }
    }

    handleClearForm() {
        this.selectedRows = [];
        this.template.querySelector('lightning-datatable').selectedRows = [];
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