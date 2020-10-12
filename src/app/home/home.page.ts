import { Component, Renderer2, ViewChild } from '@angular/core';
import { Animation, AnimationController, Gesture, GestureController, GestureDetail, Platform } from '@ionic/angular'; 

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
    @ViewChild('blocks') blocks: any; // pegando o elemente do html e definindo pro .ts
    @ViewChild('background') background: any; // pegando o elemente do html e definindo pro .ts
    @ViewChild('swipeDown') swipeDown: any;

    public options: Array<any> = [
      { icon: 'person-add-outline' , text: 'Indicar amigos' },
      { icon: 'phone-portrait-outline' , text: 'Recarga de celular' },
      { icon: 'wallet-outline' , text: 'Depositar' },
      { icon: 'options-outline' , text: 'Ajustar Limite' },
      { icon: 'help-circle-outline' , text: 'Me ajuda' },
      { icon: 'barcode-outline' , text: 'Pagar' },
      { icon: 'lock-open-outline' , text: 'Bloquear cartão' },
      { icon: 'card-outline' , text: 'Cartão virtual' },
    ];

    public slideOptions: any = { slidesPerView: 3, freeMode: true};

    public items: Array<any> = [
      { icon: 'help-circle-outline', text: 'Me ajuda' },
      { icon: 'person-outline', text: 'Perfil' },
      { icon: 'cash-outline', text: 'Configurar Conta' },
      { icon: 'card-outline', text: 'Configurar Cartão' },
      { icon: 'phone-portrait-outline', text: 'Configurações do app' },
      

    ];

    // variaveis que eu criei as do constructor sao as prontas do ionic 
    public initialStep: number = 0; // sempre comecar em cima
    private maxTranslate: number;  //animar o container dos blocks com o translate
    private animation: Animation;  //criar a primeira animação (Animation) ja e do proprio angular
    private gesture: Gesture;  //variavel de gesto
    private swiping: boolean = false; //detectar se a pessoa esta puxando ou não

  constructor( //todos esses privates sao classes ja do ionic  fazendos os imports do angular e o ionic 
    private animationCtrl: AnimationController,
    private platform: Platform,
    private renderer: Renderer2, // manipula eventos do dom 
    private gestureCtrl: GestureController // controlador do gesto

    ) { 
        this.maxTranslate = this.platform.height() -200; // pega altura da tela -200
     } 

     ngAfterViewInit() { //evento começa depois que carrega todos com components
        this.createAnimation(); // criar/ detectar animação
        this.detectSwipe();// detectar o swiping
     }

     detectSwipe() {
       this.gesture = this.gestureCtrl.create({ //vai criar os gestos e declarar novas propriedades
        el: this.swipeDown.el, // qual elemento vai pegar 
        gestureName: 'swipe-down', // nome do gesto
        threshold: 0, // frenquencia que detecta o gesto
        onMove: ev => this.onMove(ev),
        onEnd: ev => this.onEnd(ev),
       }, true); //precisa pois ele vai esperar esse gesto acontecer

       this.gesture.enable(true);

     }

     onMove(ev: GestureDetail) {  // capturando o movimento 
        if (!this.swiping) {
          this.animation.direction('normal').progressStart(true);

          this.swiping = true;
        }

        const step: number = this.getStep(ev)

        this.animation.progressStep(step); // ir para o valor que tiver retornando em step assim mudando a animação
        this.setBackgrounsOpacity(step);  // ir para o valor que tiver retornando em step assim mudando a opacidade 
     }

     onEnd(ev: GestureDetail) {
        if (!this.swiping) return; // vai verificar se esta occorendo o swiping se n estiver ele vai retornar
     
        this.gesture.enable(false); //proibe a pesso de interromper a animação

        const step: number = this.getStep(ev);
        const shouldComplete: boolean = step > 0.5; // vai verificar se ele vai pra baixo ou vai pra cima (maior q 0.5 cima/ menor q 0.5 vai para baixo)

        this.animation.progressEnd(shouldComplete ? 1: 0, step); // verifica se vai completar ou não a animação 

        this.initialStep = shouldComplete ? this.maxTranslate : 0; // redefinir qual vai ser o novo initialStep

        this.setBackgrounsOpacity();

        this.swiping = false;
     }

     getStep(ev: GestureDetail): number { // vai fazer a conta para a animação entre 0/1
       const delta: number = this.initialStep + ev.deltaY;

       return delta / this.maxTranslate;
     }

     toggleBlocks() {
       this.initialStep = this.initialStep = this.initialStep === 0 ? this.maxTranslate : 0; // vai verificar se vai ocorrer ou nao a animação com o click

       this.gesture.enable(false); // nao detectar nenhum gesto, se ficar sem isso buga e não consegue arrastar a animação dp card mais de 1 vez

       this.animation.direction(this.initialStep === 0 ? 'reverse' : 'normal').play(); // faz a animação (direction vai ver se vai estar me cima ou em baixo)

       this.setBackgrounsOpacity(); //criando o metodo da opacidade
     }

     createAnimation() { // criando a function de animação
        this.animation = this.animationCtrl.create()
        .addElement(this.blocks.nativeElement)  //pegando o elemento do html (tipo o getElementById)
        .duration(300) //adicionando a duracao
        .fromTo('transform' , 'translateY(0)', `translateY(${this.maxTranslate}px)`) // define ate onde vai o translate com o click (valor definido em maxTranslate) 
        .onFinish(() => this.gesture.enable(true)); // permite realizar a animação de puxar o card mais de uma vez 
     }

     setBackgrounsOpacity(value: number = null) {
      this.renderer.setStyle(this.background.nativeElement, 'opacity', value ? value : this.initialStep === 0 ? '0' : '1'); // vai setar  um style puxando o element do html 'background' (redenrer que faz essa mudança de style) no caso mudando a opacity  tantp definido no scss como no html e no .ts
     }

     fixedBlocks(): boolean { // function() la do html 
       return this.swiping || this.initialStep === this.maxTranslate; //  maxTranslate sempre vai ser o maior valor e o fixo e o initialStep onde vai começar a animaçaõ (cima ou baixo) e se for em baixo ele vai ser o msm valor q o maxTrasnlate assim ficando fixo
     }

}
