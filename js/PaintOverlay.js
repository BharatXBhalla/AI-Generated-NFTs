class PaintOverlay{
    constructor(_document,_id,_painting_manager,max_height){
        this.document =_document;
        this.id=_id;
        this.painting_manager=_painting_manager;
        this.max_height=max_height;
    }
    openOverlay() {
		this.document.getElementById(this.id).style.height = this.max_height;
	}
	  
	closeOverlay() {
		this.document.getElementById(this.id).style.height = "0%";
	}
}



