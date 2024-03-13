import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase(); 
    //POKEMON CREATED
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;

    } catch (error) {
      if( error.code === 11000 ) {
        throw new BadRequestException(`Pokemon exists in db ${ JSON.stringify( error.keyValue )}`)
      }
      console.log(error);
      throw new InternalServerErrorException(`Can't create Pokemon - Check server logs`)
    }
  }

  async findAll( paginationDto: PaginationDto) {
      const { limit = 10, offset = 0 } = paginationDto;

      return this.pokemonModel.find()
                              .limit(limit)
                              .skip(offset)
                              .sort({
                                no: 1
                              })
                              .select('-__v')
  }                          
  
  //FIND A POKEMON
  async findOne(term: string) {
    
     let pokemon: Pokemon;

     if( !isNaN(+term) ) {
        pokemon = await this.pokemonModel.findOne({ no: term })
     }

     //Mongo ID
     if( !pokemon && isValidObjectId(term) ) {
       pokemon = await this.pokemonModel.findById( term )
     }


     if( !pokemon ) throw new NotFoundException(`Pokemon with id, name or no ${ term } not found`)
     return pokemon;
  }

  //ACTUALIZACIÓN
  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
     const pokemon = await this.pokemonModel.findOne({ no: term })
     
     if( updatePokemonDto.name ) 
       updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
     
     try {
      await pokemon.updateOne( updatePokemonDto, { new: true });
      return { ...pokemon.toJSON(), ...updatePokemonDto }

     } catch (error) {
       this.handleExceptions( error )
     }
     

  }
  
  //DELETE
  async remove(id: string) {
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id })
    if( deletedCount === 0 )
      throw new BadRequestException(`Pokemon with ${ id } not found`)
    
    return;
  }
  
  //HANDLE ERRORS DUPLICATED
  private handleExceptions( error: any ) {
    if( error.code === 11000 ) {
      throw new BadRequestException(`Pokemon exists in db ${ JSON.stringify( error.keyValue )}`)
    }
    console.log(error);
    throw new InternalServerErrorException(`Can't create Pokemon - Check server logs`)
  }
}
