<template>
  <div class="container">
    <div class="content column">
      <h3>🚚 Flet</h3>
      <form @submit.prevent="submit">
        <div class="field has-addons">
          <div class="control">
            <input ref="input" v-model="query" class="input is-rounded" type="text" placeholder="Evento, lugar, fecha, jugador o PGN" autofocus>
          </div>
          <div class="control">
            <button type="submit" id="searchbtn" class="button is-rounded is-primary">
              <span>🔎</span>
            </button>
          </div>
        </div>
      </form>   
      <div v-if="data.count" class="has-text-left">
        <table class="table is-narrow is-striped is-fullwidth">
          <thead>
            <th>Mesa</th>
            <th>Evento</th>
            <th>Lugar</th>
            <th>Blancas</th>
            <th>Negras</th>
            <th>Resultado</th>
            <th>Fecha</th>
            <th>Movimientos</th>
          </thead>
          <tbody>
            <tr v-for="item in data.games">
              <td>
                <router-link :to="'/game/'+item.room">👁</router-link>
              </td>
              <td>
                <span v-html="item.event"></span>
              </td>
              <td>
                <span v-html="item.site"></span>
              </td>
              <td>
                <span v-html="item.white"></span>
              </td>
              <td>
                <span v-html="item.black"></span>
              </td>
              <td>
                <span v-html="item.result"></span>
              </td>
              <td>
                <span v-html="item.date"></span>
              </td>
              <td>
                <span v-html="$root.countMoves(item.pgn)"></span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <nav class="pagination is-centered is-rounded" role="navigation" aria-label="pagination">
      <!--a class="pagination-previous">Previous</a>
      <a class="pagination-next">Next page</a-->
      <ul class="pagination-list">
        <li v-for="(page, index) in pages">
          <router-link :to="'?q=' + query + '&offset=' + page" class="pagination-link" :class="{'is-current': offset == page}" :title="'Ir a página ' + index"></router-link>
        </li>
      </ul>
    </nav>     
  </div>
</template>

<script>

  import axios from 'axios'
  import snackbar from '../components/Snackbar';
  export default {
    name: 'results',
    watch: {
      '$route': function () {
        this.triggerSearch()
      }
    },
    mounted: function(){
      this.triggerSearch()
    },
    methods : {
      triggerSearch: function(){
        if(this.$route.query.q){
          this.query = this.$route.query.q
        }
        if(this.$route.query.offset){
          this.offset = parseInt(this.$route.query.offset)
        }
        this.$nextTick(() => this.$refs.input.focus())
        this.search()
      },
      search: function() {
        this.$root.loading = true
        axios.post('/search', {query:this.query,offset:this.offset,limit:this.limit} ).then((res) => {
          this.data = res.data

          var pages = []
          if(res.data.error){
            if(res.data.error==='not_enough_params'){
              snackbar('info','Por favor ingresa una palabra clave para ver partidas. Puedes buscar por evento, lugar, jugador o PGN.', 15000);  
            }
          } else {
            if(res.data.count===0){
              snackbar('danger','No hay partidas que coincidan con tu palabra clave.', 5000);
            } else {
              var numPages = Math.ceil(res.data.count/this.limit)
              for(var i=1;i< numPages+1;i++){
                pages[i] = (i-1)*this.limit
              }
              snackbar('success','Se econtraron ' + this.data.count  +  ' partida' + (this.data.count>1?'s':'')  + '. Mostrando resultados de ' + (this.offset + 1) + ' a ' + (this.offset + this.limit > this.data.count ? this.data.count : this.offset + this.limit ), 5000);
            }
          }
          this.pages = pages
          this.$root.loading = false
        })      
      },
      submit: function(){
        this.$router.push('/results?q=' + this.query)
      }    
    },
    data () {
      return {
        data:{count:0,games:[]},
        pages:{},
        query:'',
        limit:10,
        offset:0,
        msg: 'Results'
      }
    }
  }
</script>
