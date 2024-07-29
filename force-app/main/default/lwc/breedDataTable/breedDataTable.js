import { LightningElement, api } from 'lwc';

const COLUMNS = [
    {label: 'Breed Name', fieldName: 'breedName', type: 'text', sortable: true},
    {label: 'Minimum Life', fieldName: 'lifeMin', type: 'number',
        cellAttributes: { alignment: 'left' }},
    {label: 'Maximum Life', fieldName: 'lifeMax', type: 'number',
        cellAttributes: { alignment: 'left' }},
    {label: 'Description', fieldName: 'description', type: 'text', wrapText: true, initialWidth: 350},
    {label: 'Hypoallergenic', fieldName: 'hypoallergenic', type: 'boolean'}

]

export default class BreedDataTable extends LightningElement {
    @api breedData = [];
    columns = COLUMNS;
    selectedRows = [];
    defaultSortDirection = 'asc';
    sortDirection = 'asc';
    sortedBy;

    handleRowSelection(event) {
        this.selectedRows = [...event.detail.selectedRows];
        this.dispatchEvent(new CustomEvent('rowselected', {
            detail: this.selectedRows
        }));
    }

    @api
    handleClearSelections() {
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
        const cloneData = [...this.breedData];

        cloneData.sort(this.sortBy(sortedBy, sortDirection === 'asc' ? 1 : -1));
        this.breedData = cloneData;
        this.sortDirection = sortDirection;
        this.sortedBy = sortedBy;
    }
}