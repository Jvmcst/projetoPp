import { Component, OnInit, Renderer2 } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActionSheetController, NavController, ToastController } from '@ionic/angular';
import { Usuario } from 'src/app/model/usuario';
import { FotoService } from 'src/app/services/foto.service';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-criar-conta',
  templateUrl: './criar-conta.page.html',
  styleUrls: ['./criar-conta.page.scss'],
})
export class CriarContaPage implements OnInit {
  formGroup: FormGroup;
  darkTheme: boolean = false;
  selectedImage: any;

  constructor(private renderer: Renderer2, private actionSheetController: ActionSheetController, private fotoService: FotoService, private usuarioService: UsuarioService, private formBuilder: FormBuilder, private navController: NavController, private toastController: ToastController) {

    this.formGroup = this.formBuilder.group({
      'nome': [, Validators.compose([
        Validators.required,
      ])],
      'foto': [, Validators.compose([])],
      'email': [, Validators.compose([
        Validators.email,
        Validators.required,
      ])],
      'senha': [, Validators.compose([
        Validators.required,
        Validators.minLength(8),
      ])],
      'senhaRepetida': [, Validators.compose([
        Validators.required,
        Validators.minLength(8),
      ])],
      'telefone': [, Validators.compose([
        Validators.required,
        Validators.maxLength(11),
        Validators.minLength(11)
      ])],
    }, { Validators: passwordsMatch() });

  }

  mudarTema() {
    this.darkTheme = !this.darkTheme; // Toggle the current theme
    if (this.darkTheme) {
      this.renderer.setAttribute(document.body, 'color-theme', 'dark');
      // src: "assets/icon/logo1.png";
    } else {
      this.renderer.setAttribute(document.body, 'color-theme', 'light'); // Assuming you have a 'light' theme defined as well
      // src:"assets/icon/logo.png";
    }
  }

  ngOnInit() {
  }

  async takePhoto() {
    await this.fotoService.register();
  }

  async removeFoto(posicao: number) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Fotos',
      buttons: [{
        text: 'Excluir',
        icon: 'trash',
        handler: () => {
          this.fotoService.remove();
        }
      }, {
        text: 'Cancelar',
        icon: 'close',
      }]
    });
    await actionSheet.present();
  }

  async save() {
    this.usuarioService.checkEmail(this.formGroup.value.email).then((json) => {
      if (<Boolean>(json)) {
        this.showMessage("Email já cadastrado!");
      } else {
        let usuario = new Usuario();

        usuario.nome = this.formGroup.value.nome;
        usuario.email = this.formGroup.value.email;
        usuario.senha = this.formGroup.value.senha;
        usuario.telefone = this.formGroup.value.telefone;
        //usuario.foto = this.formGroup.value.foto;
        usuario.foto = "Ainda sem fotos!";

        this.usuarioService.saveUsuario(usuario).then((json) => {
          usuario = <Usuario>(json);
          if (usuario) {
            this.showMessage('Usuário registrado com sucesso!');
            this.navController.navigateBack('/home');
            this.usuarioService.saveIdUsuario(usuario.idUsuario);
          } else {
            this.showMessage('Erro ao salvar o registro!')
          }
        })
          .catch((error) => {
            this.showMessage('Erro ao salvar o registro! Erro: ' + error['mensage']);
          });
      }
    });
  }

  async showMessage(texto: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 1500
    });
    toast.present();
  }

  openGallery() {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  previewImage(event: any) {
    const file = event.target?.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target) {
          this.selectedImage = e.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  }

}

export function passwordsMatch(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const senha = control.get('senha')?.value;
    const senhaRepetida = control.get('senhaRepetida')?.value;

    return senha === senhaRepetida ? null : { passwordsNotMatch: true };
  };
}



// export function verify(): ValidatorFn {
//   return (control:AbstractControl) : ValidationErrors | null => {

//       const value = control.value;

//       if (!value) {
//           return null;
//       }

//       const passwordValid = false;

//       return !passwordValid ? {passwordStrength:true}: null;
//   }
// }