/// <reference path="jquery.d.ts" />

interface Window {
    $: JQueryStatic;
}
interface JQuery {
    value: string;
}
declare class HTMLControls {
    public version: number;
    public radioControls: any;
    public checkboxControls: any;
    public buttonControls: any;
    public sliderControls: any;
    public registered: boolean;
    public setSelectedRadio(groupName, index): void;
    public addRadioControl(radioControlOptions): void;
    public addCheckboxControl(checkboxControlOptions): void;
    public addButtonControl(buttonControlOptions): void;
    public addSliderControl(sliderControlOptions): void;
    public getSliderValue(id): number;
    public getHandler(): (e: any) => void;
    public register(): void;
    public updateRadio(elementID, isSelected): void;
    public updateCheckbox(elementID, isSelected): void;
    public updateSlider(elementID, value): void;
    static create(): HTMLControls;
}
