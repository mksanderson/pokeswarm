namespace Application{
	export class FormData{
		public messages: string[];
		public name: string;
		public position: Position;

		constructor(){
			this.messages = new Array<string>();
			this.name = '';
		}
	}
}