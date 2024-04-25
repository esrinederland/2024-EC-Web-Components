1. Import custom component
```html
<script type="module" src="/src/components/poi-marker.ts"></script>
```

2. Add custom component to map
```html
<arcgis-expand expand-icon="cursor-plus" position="top-left">
  <arcgis-placement>
    <poi-marker></poi-marker>
  </arcgis-placement>
</arcgis-expand>
``` 