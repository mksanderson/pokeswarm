namespace Application {
	export class Pokemon {
		public Classification: string;
		public FastAttacks: string[];
		public FleeRate: number;
		public Height: Object;
		public MaxCP: number;
		public MaxHP: number;
		public Name: string;
		public Number: string;
		public PreviousEvolutions: string[];
		public Resistant: string[];
		public Types: string[];
		public SpecialAttacks: string[];
		public Weaknesses: string[];
		public Weight: Object;

		constructor() {
			this.Classification = '';
			this.FastAttacks = new Array<string>();
			this.FleeRate = 0;
			this.Height = new Object();
			this.MaxCP = 0;
			this.MaxHP = 0;
			this.Name = '';
			this.Number = '';
			this.PreviousEvolutions = new Array<string>();
			this.Resistant = new Array<string>();
			this.Types = new Array<string>();
			this.SpecialAttacks = new Array<string>();
			this.Weaknesses = new Array<string>();
			this.Weight = new Object();
		}
	}
}
