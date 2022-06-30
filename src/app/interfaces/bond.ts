export interface Bond{
  id:number;
  valorNominal: number;
  tasaCupon: number;
  periodoDePago: number;
  vencimiento: number;
  tasaNegociacion: number;
  mercadoPrimario: boolean;
  convexidad: number;
  tir: number;
  duracion: number;
  duracionModificada: number
}
