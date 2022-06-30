import {Component, OnInit, ViewChild} from '@angular/core';
import {Bond} from "../interfaces/bond";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatDialog} from "@angular/material/dialog";
import {ActivatedRoute, Router} from "@angular/router";

export interface Amortizaciones {
  position: number;
  capital: number;
  amortizacion: number;
  intereses: number;
  couta: number;
}
export interface Flujos {
  position: number;
  flujos: number;
  flujoV: number;
}
export interface Convexidad {
  flujoVPT:number ;
  convexidad: number;
}


@Component({
  selector: 'app-bond-calculator',
  templateUrl: './bond-calculator.component.html',
  styleUrls: ['./bond-calculator.component.css']
})
export class BondCalculatorComponent implements OnInit {
  userData: any;
  bondData: Bond;
  tazaconvertida = 0;
  selectedPeriod = '';
  periods = [
    { id: 1, name: 'Anual' },
    { id: 2, name: 'Semestral' },
    { id: 3, name: 'Trimestral' },
    { id: 4, name: 'Bimestral' },
    { id: 5, name: 'Mensual' },
    { id: 6, name: 'Diaria' }]
  bondForm: FormGroup=this.formBuilder.group({
    valorNominal:['',{validators:[Validators.required],updateOn:'change'}],
    tasaCupon:['',{validators:[Validators.required],updateOn:'change'}],
    vencimiento:['',{validators:[Validators.required],updateOn:'change'}],
    tasaNegociacion:['',{validators:[Validators.required],updateOn:'change'}],
  });
  auxFlujo:Amortizaciones;
  auxFlujoVp:Flujos;
  auxFlujovpt:Convexidad;
  I=0;
  sumaFlujoVp=0;
  sumaFlujoVPT=0;
  sumaConvexidad=0;
  tasaNegConvertida=0;
  duracion=0;
  duracionMod=0;
  convexidad=0;
  varTasaNeg=0;
  varPrecioBono=0;
  precioBono=0;
  E=0;
  isSubmitted:boolean=false;
  columnsAmortizacion: string[] = ['position', 'name', 'weight', 'symbol','couta'];
  dataSource =  new MatTableDataSource<Amortizaciones>([]);
  dataSource2 =  new MatTableDataSource<Flujos>([]);
  columnsConxexidad: string[] = ['flujovpt', 'convexidad'];
  dataSource3 =  new MatTableDataSource<Convexidad>([]);
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  flujoA:Amortizaciones[]=[];
  flujoVP:Flujos[]=[];
  flujoCon:Convexidad[]=[];

  constructor(private formBuilder:FormBuilder,public dialog: MatDialog,private ruta:ActivatedRoute,private route:Router) {
    this.userData=JSON.parse(sessionStorage.getItem('user') || '{}');

    this.bondData={}as Bond;
    this.auxFlujo={}as Amortizaciones;
    this.auxFlujoVp={}as Flujos;
    this.auxFlujovpt={}as Convexidad;
    this.paginator={}as MatPaginator;
    this.ruta.params.subscribe(params=>{
      console.log(params['id']);
      this.E=params['id'];
    });
    if(this.E==2){
      this.bondData=JSON.parse(localStorage.getItem('cartera') || '{}');
      this.calculate();
    }
  }

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;
    console.log(this.userData);
  }
  get valorNominal(){return this.bondForm.get('valorNominal');}
  get tasaNegociacion(){return this.bondForm.get('tasaNegociacion');}
  submitForm(){
    console.log()
    this.isSubmitted=true;
  }
  calculatePeriod(){
    if (this.selectedPeriod=="Anual"){
      let a=this.bondData.tasaCupon/100;
      this.tazaconvertida=a/1;
      let b=this.bondData.tasaNegociacion/100;
      this.tasaNegConvertida=b/1;
      this.I=this.bondData.vencimiento*1;
      this.bondData.periodoDePago=1;
    }
    if (this.selectedPeriod=="Semestral"){
      let a=this.bondData.tasaCupon/100;
      this.tazaconvertida=a/2;
      let b=this.bondData.tasaNegociacion/100;
      this.tasaNegConvertida=b/2;
      this.I=this.bondData.vencimiento*2;
      this.bondData.periodoDePago=2;
    }
    if (this.selectedPeriod=="Trimestral"){
      let a=this.bondData.tasaCupon/100;
      this.tazaconvertida=a/4;
      let b=this.bondData.tasaNegociacion/100;
      this.tasaNegConvertida=b/4;
      this.tazaconvertida=this.bondData.tasaCupon/4;
      this.I=this.bondData.vencimiento*4;
      this.bondData.periodoDePago=3;
    }
    if (this.selectedPeriod=="Bimestral"){
      let a=this.bondData.tasaCupon/100;
      this.tazaconvertida=a/6;
      let b=this.bondData.tasaNegociacion/100;
      this.tasaNegConvertida=b/6;
      this.tazaconvertida=this.bondData.tasaCupon/6;
      this.I=this.bondData.vencimiento*6;
      this.bondData.periodoDePago=4;
    }
    if (this.selectedPeriod=="Mensual"){
      let a=this.bondData.tasaCupon/100;
      this.tazaconvertida=a/12;
      let b=this.bondData.tasaNegociacion/100;
      this.tasaNegConvertida=b/12;
      this.tazaconvertida=this.bondData.tasaCupon/12;
      this.I=this.bondData.vencimiento*12;
      this.bondData.periodoDePago=5;
    }
    if (this.selectedPeriod=="Diaria"){
      let a=this.bondData.tasaCupon/100;
      this.tazaconvertida=a/360;
      let b=this.bondData.tasaNegociacion/100;
      this.tasaNegConvertida=b/360;
      this.tazaconvertida=this.bondData.tasaCupon/360;
      this.I=this.bondData.vencimiento*360;
      this.bondData.periodoDePago=6;
    }

  }

  refreshTables(){
    this.flujoA.splice(0,this.flujoA.length);
    this.flujoVP.splice(0,this.flujoVP.length);

    this.flujoCon.splice(0,this.flujoCon.length);
    this.I=0;
    this.sumaFlujoVp=0;
    this.sumaFlujoVPT=0;
    this.sumaConvexidad=0;
    this.tasaNegConvertida=0;
    this.duracion=0;
    this.duracionMod=0;
    this.convexidad=0;
    this.varTasaNeg=0;
    this.varPrecioBono=0;
    this.precioBono=0;

    this.refresh(this.flujoA,this.flujoVP,this.flujoCon);
  }
  calculate() {
    this.calculatePeriod();
    for (let i = 1; i <= this.I; i++) {
      this.auxFlujo.position=i;

      if(i==1){
        this.auxFlujo.intereses=this.bondData.valorNominal*this.tazaconvertida;
        this.auxFlujo.amortizacion=0;
        this.auxFlujo.capital=this.bondData.valorNominal-this.auxFlujo.amortizacion;
        this.auxFlujo.couta=this.auxFlujo.amortizacion+this.auxFlujo.intereses;
      }

      this.auxFlujo.intereses=this.bondData.valorNominal*this.tazaconvertida;
      this.auxFlujo.amortizacion=0;
      if(i==this.I){
        this.auxFlujo.amortizacion=this.bondData.valorNominal;
      }
      this.auxFlujo.couta=this.auxFlujo.intereses+this.auxFlujo.amortizacion;
      this.auxFlujo.capital=this.bondData.valorNominal-this.auxFlujo.amortizacion;
      this.auxFlujoVp.position=i;
      this.auxFlujoVp.flujos=this.bondData.valorNominal*this.tazaconvertida;
      this.auxFlujoVp.flujoV=this.auxFlujoVp.flujos/Math.pow((1+this.tasaNegConvertida),i);
      if(i==this.I){
        this.auxFlujoVp.flujos=(this.bondData.valorNominal*this.tazaconvertida)+this.bondData.valorNominal;
        this.auxFlujoVp.flujoV=this.auxFlujoVp.flujos/Math.pow((1+this.tasaNegConvertida),i);
      }
      this.sumaFlujoVp=this.sumaFlujoVp+this.auxFlujoVp.flujoV;
      this.auxFlujovpt.flujoVPT=i*this.auxFlujoVp.flujoV;
      this.sumaFlujoVPT=this.sumaFlujoVPT+this.auxFlujovpt.flujoVPT;
      this.auxFlujovpt.convexidad=+(this.auxFlujoVp.flujoV)*((Math.pow(i,2)+i)/Math.pow((1+this.tasaNegConvertida),i));
      this.sumaConvexidad=this.sumaConvexidad+this.auxFlujovpt.convexidad;
      this.duracion=this.sumaFlujoVPT/this.sumaFlujoVp;
      this.duracionMod=this.duracion/(1+this.tasaNegConvertida);
      this.varTasaNeg=(10/100);
      this.varPrecioBono=(this.duracionMod)*this.varTasaNeg;
      this.precioBono=+this.sumaFlujoVp*(1-this.varPrecioBono);
      this.convexidad=(1/(this.sumaFlujoVp*Math.pow((1+this.tasaNegConvertida),2)))*this.sumaConvexidad;
      this.flujoA.push(this.auxFlujo);
      this.flujoVP.push(this.auxFlujoVp);
      this.flujoCon.push(this.auxFlujovpt);
      this.auxFlujo={position: 0, intereses:0,capital: 0, amortizacion:0,couta:0};
      this.auxFlujoVp={position:0,flujos:0,flujoV:0};
      this.auxFlujovpt={flujoVPT:0,convexidad:0};
    }

    this.refresh(this.flujoA,this.flujoVP,this.flujoCon);
  }
  refresh(data:any,data2:any,data3:any) {
    this.dataSource.data = data;
    this.dataSource2.data=data2;
    this.dataSource3.data=data3;
  }
  logOut(){
    localStorage.removeItem('user');
    return this.route.navigateByUrl('/login');
  }
}
