import { Body, Controller, Get, Injectable, Post, Res, Session } from "@nestjs/common";
import { Response } from "express";
import { RegisterDto } from "../../dto/request/register.dto";
import { AuthService } from "../../auth.service";

@Injectable()
@Controller('register')
export class RegisterController{
  constructor(private authService: AuthService) {}

@Get()
loadRegisterView(@Res() res: Response){
 return res.render('auth/register', {
  title: 'Register',
  page_title: 'Register',
  folder: 'Authentication',
  layout: "layouts/layout-without-nav",
  data : [],
  oldInputs: [],
  message: [],
  error: []
 });
}

@Post()
async register(
    @Body() body: any,
    @Session() session: Record<string, any>,
    @Res() res: Response
  ) {
   
    if (session.userId) return res.redirect('/');

    const user = await this.authService.register(body);

    if (user) {
      session.userId = user.id;
      return res.redirect('/');
    }
    
    return res.render('auth/register', {
      title: 'Register',
      page_title: 'Register',
      folder: 'Authentication',
      layout: "layouts/layout-without-nav",
      oldInputs: body,
      data : [],
      message: [],
      error: [
        'Registration failed, due to invalid data'
      ]
    });
  }
}