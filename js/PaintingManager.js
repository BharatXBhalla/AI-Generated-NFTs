
class PaintingManager{
    paintlist = {};
    selected_painting_id;
    addPainting(_painting){
        this.paintlist[_painting.id]=_painting;
    }
    getPainting(_id){
        return  this.paintlist[_id];
    }
    getSelectedPainting(){
        return this.paintlist[this.selected_painting_id];
    }
}