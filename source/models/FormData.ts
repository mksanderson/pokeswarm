namespace Application{
	export class FormData{
		public name: string;
		public position: Position;
		public record: Pokemon;

		constructor(){
			this.name = '';
			this.record = new Pokemon();
		}
	}
}