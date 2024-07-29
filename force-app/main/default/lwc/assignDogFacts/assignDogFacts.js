import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class AssignDogFacts extends LightningElement {
    data = [];
    firstName = '';
    lastName = '';
    email = '';
    selectedRows = [];
    records = [];
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
        this.selectedRows = event.detail;
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
        const fullName = `${this.firstName} ${this.lastName}`;
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
                message: 'Breed facts have been assigned',
                variant: 'success'
            }));
            this.renderFlow = false;
        }
    }

    handleClearForm() {
        this.selectedRows = [];
        this.template.querySelector('c-breed-data-table').handleClearSelections();
    }
}