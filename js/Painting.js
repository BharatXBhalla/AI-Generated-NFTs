class Painting{
    constructor(_description,_imgname,_buylink,_id,_name){
        this.description=_description;
        this.imgname=_imgname;
        this.buylink=_buylink;
        this.id=_id;
        this.name=_name;
    }
    setDescription(_description){
        this.description=_description;
        return this;
    }
    setImgname(_imgname){
        this.imgname=_imgname;
        return this;
    }
    setBuylink(_buylink){
        this.buylink=_buylink;
        return this;
    }
    setId(_id){
        this.id=_id;
        return this;
    }
    setName(_name){
        this.name=_name;
        return this;
    }
    getDescription(){
        return this.description
    }
    getImgname(){
        return this.imgname;
    }
    getBuylink(){
        return this.buylink;
    }
    getId(){
        return this.id;
    }
    getName(){
        return this.name;
    }
}

class PaintingListBuilder{
    constructor(){
        this.paintinglist=[]
    }

    addPainting(){
        var p=new Painting();
        this.paintinglist.push(p);
        return p;
    }

    getPainting(i){
        return this.paintinglist[i];
    }

    lengthOfList(){
        return this.paintinglist.length;
    }

    buildPainting(i){
        return this.paintinglist[i];
    }

    build(){
        return this.paintinglist;
    }
}