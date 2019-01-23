import { Httpservice } from "./../services/httpservice.service";
import { StoreService } from "./../store/store.service";
import { AlertService } from "./../services/alert.service";
import { Component, OnInit, ViewChild, NgZone } from "@angular/core";
import { EMPLOYEE_PROFILE, CLOUDINARY_NAME, CLOUDINARY_PRESET } from "../../constants";
import * as _ from "lodash";
import { NgbTabset } from "@ng-bootstrap/ng-bootstrap";
import { HttpClient } from "@angular/common/http";
import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from "ng2-file-upload";
import { Cloudinary } from "@cloudinary/angular-5.x";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.css"]
})
export class ProfileComponent implements OnInit {

  public profile: any;
  public photo = "/assets/images/default_user.png";
  public employees: any = [];
  public manager: any = {};
  public logs: any = [];
  public pass: any = {};
  public fileToUpload: File = null;
  public edit: Boolean = false;
  public model: any = {};
  @ViewChild("tabRef") public tabs: NgbTabset;

  private hasBaseDropZoneOver: Boolean = false;
  private uploader: FileUploader;
  private title: string;
  public responses: any;

  constructor(public alert: AlertService, public store: StoreService, public http: Httpservice,
    private cloudinary: Cloudinary, private zone: NgZone) {
    this.profile = this.store.get("profile");
    this.getProfile();
    this.employees = this.store.get("photos");
    this.manager = _.find(this.employees, { id: this.profile.employee.reportingTo }) || this.employees[0];

    this.responses = [];
    this.title = "";
  }

  editForm() {
    this.edit = true;
    this.model.phone = this.profile.employee.phone;
    this.model.email = this.profile.employee.email;
    this.model.address = this.profile.employee.address;
  }

  updatePass() {
    if (!this.pass.old || this.pass.old.length === 0) {
      this.alert.showAlert("Enter your Old Password!!", "warning");
      return false;
    } else if (this.pass.new !== this.pass.confirm) {
      this.alert.showAlert("New and Confirm Password are not Matching!!", "warning");
      return false;
    }
    this.alert.showLoader(true);
    this.http.PUT(EMPLOYEE_PROFILE, this.pass).subscribe((res) => {
      this.profile.employee.modified = new Date();
      this.pass = {};
      this.tabs.select("about");
      this.alert.showLoader(false);
    });
  }

  updateForm() {
    console.log(this.model);
    const emailValid = /\S+@\S+\.\S+/.test(this.model.email);
    if (!emailValid) {
      this.alert.showAlert("Email address entered is Invalid!!", "warning");
      return false;
    } else if (this.model.phone.toString().length !== 10) {
      this.alert.showAlert("Phone number should be 10 digit number", "warning");
      return false;
    } else if (!this.model.address.street || !this.model.address.city || !this.model.address.state || !this.model.address.pincode) {
      this.alert.showAlert("Address is Required!!", "warning");
      return false;
    } else if (this.model.address.pincode.toString().length !== 6) {
      this.alert.showAlert("Check the Pincode Entered!!!", "warning");
      return false;
    }

    this.model.address.country = "India";
    this.alert.showLoader(true);
    this.http.POST(EMPLOYEE_PROFILE, this.model).subscribe((res) => {
      this.profile.employee.modified = new Date();
      this.profile.employee.phone = this.model.phone;
      this.profile.employee.email = this.model.email;
      this.profile.employee.address = this.model.address;
      this.edit = false;
      this.alert.showLoader(false);
    });
  }

  getProfile() {
    this.alert.showLoader(true);
    this.http.GET(EMPLOYEE_PROFILE).subscribe((res) => {
      this.profile = res;
      this.photo = this.profile.employee.photo;
      this.profile.employee.address = {};
      this.store.set("profile", res);
      this.alert.showLoader(false);
    });
  }

  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
    console.log(this.fileToUpload);
  }

  ngOnInit(): void {
    // Create the file uploader, wire it to upload to your account
    const uploaderOptions: FileUploaderOptions = {
      url: `https://api.cloudinary.com/v1_1/${CLOUDINARY_NAME}/upload`,
      // Upload files automatically upon addition to upload queue
      autoUpload: true,
      // Use xhrTransport in favor of iframeTransport
      isHTML5: true,
      // Calculate progress independently for each uploaded file
      removeAfterUpload: true,
      // XHR request headers
      headers: [
        {
          name: "X-Requested-With",
          value: "XMLHttpRequest"
        }
      ]
    };
    this.uploader = new FileUploader(uploaderOptions);

    this.uploader.onBuildItemForm = (fileItem: any, form: FormData): any => {

      this.alert.showLoader(true);

      // Add Cloudinary"s unsigned upload preset to the upload form
      form.append("upload_preset", CLOUDINARY_PRESET);
      // Add built-in and custom tags for displaying the uploaded photo in the list
      let tags = "imprint_album";
      if (this.title) {
        form.append("context", `photo=${this.title}`);
        tags = `imprint_album,${this.title}`;
      }
      // Upload to a custom folder
      // Note that by default, when uploading via the API, folders are not automatically created in your Media Library.
      // In order to automatically create the folders based on the API requests,
      // please go to your account upload settings and set the "Auto-create folders" option to enabled.
      form.append("folder", "imprint");
      // Add custom tags
      form.append("tags", tags);
      // Add file to upload
      form.append("file", fileItem);

      // Use default "withCredentials" value for CORS requests
      fileItem.withCredentials = false;
      return { fileItem, form };
    };

    // Update model on completion of uploading a file
    this.uploader.onCompleteItem = (item: any, response: string, status: number, headers: ParsedResponseHeaders) => {
      console.log("Successfully uploaded the picture");
      const tmp = JSON.parse(response);
      this.http.POST(EMPLOYEE_PROFILE, { photo: tmp.secure_url }).subscribe((res) => {
        this.alert.showAlert("Successfully uploaded Profile picture", "success");
        this.profile.employee.photo = tmp.secure_url;
        this.store.set("profile", this.profile);
        this.alert.showLoader(false);
        setTimeout(() => {
          window.location.reload(true);
        });
      });
    };

    // Update model on upload progress event
    this.uploader.onProgressItem = (fileItem: any, progress: any) =>
      console.log("Uploading", progress + "%");
  }

  updateTitle(value: string) {
    this.title = value;
  }

}
