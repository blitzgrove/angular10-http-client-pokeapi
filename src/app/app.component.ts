import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { PokemonApiService } from './services/pokemon-api.service';

import { Observable, Subject } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})
export class AppComponent implements OnInit, OnDestroy {
  pokemons = [];
  idForm: FormGroup;
  close$ = new Subject<any>();

  constructor(
    private _formBuilder: FormBuilder,
    private _pokemonApiService: PokemonApiService) {
    this.createIdForm();
  }

  ngOnInit() {
  }

  get start() {
    return this.idForm.controls['start'];
  };

  get end() {
    return this.idForm.controls['end'];
  };

  private createIdForm() {
    this.idForm = this._formBuilder.group({
      start: [null, {
        Validators: [ Validators.required ]
      }],
      end: [null, {
        Validators: [
          Validators.required,
          Validators.maxLength(4), 
          Validators.min(1)
        ]
      }]
    });
  }

  private getOffsetLimit(start: number, end: number) {
    let offset = start - 1;
    let limit = end - offset;
    return [String(offset), String(limit)];
  }

  public getPokemonDetails() {
    this.pokemons = [];
    let [offset, limit] = this.getOffsetLimit(this.idForm.value.start, this.idForm.value.end);
    this._pokemonApiService.getListOfPokemon(limit, offset).pipe(
      map(pokemons => pokemons.map(response => response.url)),
      switchMap(urlList => this._pokemonApiService.getPokemonDetails(urlList)),
      takeUntil(this.close$)
    ).subscribe(
      res => this.pokemons = this.pokemons.concat(res),
      err => console.log(err)
    );
  }

  public getType(pokemon: any) {
    console.log(pokemon.types);
  }

  ngOnDestroy() {
    this.close$.next();
  }
}
