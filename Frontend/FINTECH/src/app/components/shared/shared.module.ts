import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';



// Importa aquí los componentes, directivas y pipes compartidos
// import { ExampleComponent } from './example/example.component';

@NgModule({
    declarations: [
        // ExampleComponent
    ],
    imports: [
        CommonModule,
        NavbarComponent,
        FooterComponent, 
       
        
    ],
    exports: [
        
        CommonModule, 
        
    ]
})
export class SharedModule { }