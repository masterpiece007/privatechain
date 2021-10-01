/**
 *                          Blockchain Class
 *  The Blockchain class contain the basics functions to create your own private blockchain
 *  It uses libraries like `crypto-js` to create the hashes for each block and `bitcoinjs-message` 
 *  to verify a message signature. The chain is stored in the array
 *  `this.chain = [];`. Of course each time you run the application the chain will be empty because and array
 *  isn't a persisten storage method.
 *  
 */

const SHA256 = require('crypto-js/sha256');
const BlockClass = require('./block.js');
const bitcoinMessage = require('bitcoinjs-message');
const hex2ascii = require('hex2ascii');

class Blockchain {

    /**
     * Constructor of the class, you will need to setup your chain array and the height
     * of your chain (the length of your chain array).
     * Also everytime you create a Blockchain class you will need to initialized the chain creating
     * the Genesis Block.
     * The methods in this class will always return a Promise to allow client applications or
     * other backends to call asynchronous functions.
     */
    constructor() {
        this.chain = [];
        this.height = -1;
        this.initializeChain();
    }

    /**DONE
     * This method will check for the height of the chain and if there isn't a Genesis Block it will create it.
     * You should use the `addBlock(block)` to create the Genesis Block
     * Passing as a data `{data: 'Genesis Block'}`
     */
    async initializeChain() {
        if( this.height === -1){
            console.log("initializing chain");
            let block = new BlockClass.Block({data: 'Genesis Block'});
            await this._addBlock(block);
            console.log("height: "+this.height);
            console.log("chain: "+JSON.stringify(this.chain[0]));
        }
    }

    /**DONE
     * Utility method that return a Promise that will resolve with the height of the chain
     */
    getChainHeight() {
        return new Promise((resolve, reject) => {
            resolve(this.height);
        });
    }

    /**DONE
     * _addBlock(block) will store a block in the chain
     * @param {*} block 
     * The method will return a Promise that will resolve with the block added
     * or reject if an error happen during the execution.
     * You will need to check for the height to assign the `previousBlockHash`,
     * assign the `timestamp` and the correct `height`...At the end you need to 
     * create the `block hash` and push the block into the chain array. Don't for get 
     * to update the `this.height`
     * Note: the symbol `_` in the method name indicates in the javascript convention 
     * that this method is a private method. 
     */
    _addBlock(block) {
        let self = this;
        let lastBlock = new BlockClass.Block();
        let currentHeight = 0;

        return new Promise(async (resolve, reject) => {
           
           self.getChainHeight().then(a => currentHeight = a);
           self.getBlockByHeight(self.height)
           .then(b => { 
               //lastBlock = block;
               //console.log("last-block1: "+ JSON.stringify(lastBlock))
               block.previousBlockHash = b.hash;
            })
            .catch(a => {console.log("error in getBlockByHeight: "+ a)});
           console.log("self_height: "+ self.height)
           console.log("last-block2: "+ lastBlock.hash)
           
           
           block.time = new Date().getTime().toString().slice(0,-3);
           block.height = self.height + 1;
           block.hash = SHA256(JSON.stringify(block)).toString();

           console.log("block3: "+ JSON.stringify(block))
           this.chain.push(block)
           this.height += 1;
        //    if (block) {
        //        resolve(block)
        //    }
        //    reject("an error occured")
           this.validateChain().then(errorLog =>{
            if (errorLog.length == 0) {
                resolve(block);
                
            }else{
                reject(errorLog)
            }
        })
        });
    }

    /**DONE
     * The requestMessageOwnershipVerification(address) method
     * will allow you  to request a message that you will use to
     * sign it with your Bitcoin Wallet (Electrum or Bitcoin Core)
     * This is the first step before submit your Block.
     * The method return a Promise that will resolve with the message to be signed
     * @param {*} address 
     */
    requestMessageOwnershipVerification(address) {
        return new Promise((resolve) => {
            resolve(`${address}:${new Date().getTime().toString().slice(0,-3)}:starRegistry`)
        });
    }

    /**DONE
     * The submitStar(address, message, signature, star) method
     * will allow users to register a new Block with the star object
     * into the chain. This method will resolve with the Block added or
     * reject with an error.
     * Algorithm steps:
     * 1. Get the time from the message sent as a parameter example: `parseInt(message.split(':')[1])`
     * 2. Get the current time: `let currentTime = parseInt(new Date().getTime().toString().slice(0, -3));`
     * 3. Check if the time elapsed is less than 5 minutes
     * 4. Veify the message with wallet address and signature: `bitcoinMessage.verify(message, address, signature)`
     * 5. Create the block and add it to the chain
     * 6. Resolve with the block added.
     * @param {*} address 
     * @param {*} message 
     * @param {*} signature 
     * @param {*} star 
     */
    submitStar(address, message, signature, star) {
        let self = this;
        return new Promise(async (resolve, reject) => {
            let messageTime = parseInt(message.split(':')[1]);
            let currentTime = parseInt(new Date().getTime().toString().slice(0, -3));
            if ((currentTime - messageTime) <= 300)
            {
               console.log("before verified")
               let isVerified = bitcoinMessage.verify(message, address, signature)
               if (isVerified) {
                   console.log("is verified")
                let block = new BlockClass.Block({data: star});
                this._addBlock(block);
                resolve(block);
               
               }
               reject("verification failed");
            }else{
                reject("time space elapsed");
            }

        });
    }

    /**DONE
     * This method will return a Promise that will resolve with the Block
     *  with the hash passed as a parameter.
     * Search on the chain array for the block that has the hash.
     * @param {*} hash 
     */
    getBlockByHash(hash) {
        let self = this;
        return new Promise((resolve, reject) => {
            let block = self.chain.filter(p => p.hash === hash)[0];
            if(block){
                resolve(block);
            } else {
                resolve("unable to get by hash");
            }
        });
    }

    /** DONE
     * This method will return a Promise that will resolve with the Block object 
     * with the height equal to the parameter `height`
     * @param {*} height 
     */
    getBlockByHeight(height) {
        let self = this;
        return new Promise((resolve, reject) => {
            console.log("aaa");
            let block = self.chain.filter(p => p.height === height)[0];
            console.log("chain height "+ self.chain.length);
            //console.log("block__"+ JSON.stringify(block));
            if(block){
            console.log("bbb");
                resolve(block);
            } else {
            console.log("ccc");
                reject("unable to get block height");
            }
        });
    }

    /**DONE
     * This method will return a Promise that will resolve with an array of Stars objects existing in the chain 
     * and are belongs to the owner with the wallet address passed as parameter.
     * Remember the star should be returned decoded.
     * @param {*} address 
     */
    getStarsByWalletAddress (address) {
        let self = this;
        let stars = [];
        //let bc = new BlockClass.Block();
        return new Promise((resolve, reject) => {
            self.chain.forEach(a =>{
                if (a.height > 0) {
                    //console.log("body: "+ a.body)
                    let obj = {};
                    this.getBData(a.body).then(result => {
                        obj = result;
                        console.log("obj1: "+ JSON.stringify(result))
                        let data_ = {};
                        data_ = result.data
                        stars.push( {owner: address.toString(),"star": result.data})
                    })
                    
                    //console.log("obj2: "+ JSON.stringify(obj))
                }
            })
            if (stars) {
            resolve(stars)
            }else{
                reject("stars error")
            }
        });
    }

    getBData(body) {
        // Getting the encoded data saved in the Block
        let self = this;      
        // Decoding the data to retrieve the JSON representation of the object
        return new Promise((resolve, reject) => {
            console.log("heig: "+ self.height)
        //if (self.height > 0) {
        let decoded =   hex2ascii(body);
        resolve(JSON.parse(decoded));
            
     
        })
     
    }


    /**
     * This method will return a Promise that will resolve with the list of errors when validating the chain.
     * Steps to validate:
     * 1. You should validate each block using `validateBlock`
     * 2. Each Block should check the with the previousBlockHash
     */
    validateChain() {
        let self = this;
        let errorLog = [];
        return new Promise(async (resolve, reject) => {
            self.chain.forEach(a => {
                if (a.height >0) {
                    console.log("before tamper check")
                    if (a.previousBlockHash != self.chain[a.height - 1].hash) {
                    console.log(`the hash ${self.chain[a.height - 1].hash} has been tampered with.`);

                        errorLog.push(`the hash ${self.chain[a.height - 1].hash} has been tampered with.`);
                    }
                    console.log("not tampered")
                }
            })
            resolve(errorLog);
        });
    }

}

module.exports.Blockchain = Blockchain;   