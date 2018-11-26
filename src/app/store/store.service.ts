import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import * as CryptoJS from 'crypto-js';
import 'rxjs/add/operator/share';
import { ResourcesService } from '../config/resources.service';

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  private store = new Subject<any>();
  public changes = this.store.asObservable().share();

  private privateKey: string;
  private publicKey: string;
  private enabled: boolean;

  constructor(private resources: ResourcesService) {
    this.privateKey = this.resources.crypto.privateKey;    
    this.enabled = this.resources.crypto.enabled;
  }

  set(type: string, value: any) {      
    localStorage.setItem(type, this.encrypt(JSON.stringify(value)));
    this.store.next({ type: type, value: value });
  }

  get(type: string) {
    if (type) {
      if(localStorage.getItem(type)) {
        return JSON.parse(this.decrypt(localStorage.getItem(type)));
      } else {
        return null;
      }
    } else {
       let s = [];
      for (let i = 0; i < localStorage.length; i++) {
        s.push({
          key: localStorage.key(i),
          value: JSON.parse(this.decrypt(localStorage.getItem(localStorage.key(i))))
        });
      }
      return s;
    }
  } 
  
  clear(key?: string) {
    if(key) {
      localStorage.removeItem(key);    
    } else {
      localStorage.clear();
    }    
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  encrypt(plaintext: string): string {
    if (!this.enabled)
      return plaintext;
      
    let encrypted = CryptoJS.AES.encrypt(JSON.stringify(plaintext), this.privateKey);
    return encrypted.toString();
  }

  decrypt(cypher: string): string {
    if (!this.enabled)
      return cypher;

    var bytes = CryptoJS.AES.decrypt(cypher, this.privateKey);
    var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decryptedData;
  }

}

